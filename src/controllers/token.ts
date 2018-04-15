/**
 * トークンコントローラー
 */

import { CognitoIdentityServiceProvider } from 'aws-sdk';
import * as  basicAuth from 'basic-auth';
import * as  crypto from 'crypto';
import * as  createDebug from 'debug';
import * as express from 'express';
import { BAD_REQUEST } from 'http-status';
import * as request from 'request-promise-native';

import { RedisRepository as AuthorizationCodeRepo } from '../repos/authorizationCode';

const debug = createDebug('sskts-account:controllers:token');

const COGNITO_AUTHORIZE_SERVER_ENDPOINT = process.env.COGNITO_AUTHORIZE_SERVER_ENDPOINT;
if (COGNITO_AUTHORIZE_SERVER_ENDPOINT === undefined) {
    throw new Error('Environment variable `COGNITO_AUTHORIZE_SERVER_ENDPOINT` required.');
}
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
if (COGNITO_USER_POOL_ID === undefined) {
    throw new Error('Environment variable `COGNITO_USER_POOL_ID` required.');
}
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID;
if (COGNITO_CLIENT_ID === undefined) {
    throw new Error('Environment variable `COGNITO_CLIENT_ID` required.');
}

/**
 * /oauth2/token エンドポイントは HTTPS POST のみをサポートします。ユーザープールクライアントは、システムブラウザ経由ではなくこのエンドポイントに直接リクエストを送信します。
 * トークンのエンドポイントのレスポンスに更新トークンが含まれる場合は、前の更新トークンを破棄し、新しく返された更新トークンを使用します。
 * クライアントがシークレットで発行された場合、クライアントはその client_id および client_secret をベーシック HTTP 認証を介して認証ヘッダーに渡す必要があります。
 * シークレットはベーシック Base64Encode(client_id:client_secret) です。
 *
 * @param req.body.grant_type
 * 付与タイプ。authorization_code、refresh_token、または client_credentials を指定する必要があります。
 * 必須
 * @param req.body.client_id
 * クライアント ID。
 * ユーザープールに登録済みのクライアントである必要があります。クライアントは Amazon Cognito フェデレーションが有効になっている必要があります。
 * クライアントがパブリックでありシークレットがない場合は必須です。
 * @param req.body.scope
 * クライアントに関連付けられた任意のカスタムスコープを組み合わせることができます。
 * リクエストされたスコープはクライアントにあらかじめ関連付けられている必要があります。これを行わない場合、実行時に無視されます。クライアントがスコープをリクエストしない場合、認証サーバーはクライアントに関連付けられているすべてのカスタムスコープを使用します。
 * オプション。grant_type が client_credentials である場合にのみ使用されます。
 * @param req.body.redirect_uri
 * /oauth2/authorize で authorization_code を取得するために使用された redirect_uri と同じである必要があります。
 * grant_type が authorization_code の場合のみ必須です。
 * @param req.body.refresh_token
 * 更新トークン。
 * grant_type が refresh_token の場合は必須です。
 * @param req.body.code
 * grant_type が authorization_code の場合は必須です。
 * @param req.body.code_verifier
 * 証明キー。
 * grant_type が authorization_code であり、認証コードが PKCE を使用してリクエストされた場合は必須です。
 */
export async function generate(req: express.Request, res: express.Response) {
    debug('getting token...', req.body);

    try {
        const basicUser = basicAuth(req);

        switch (req.body.grant_type) {
            case 'authorization_code':
                if (basicUser === undefined) {
                    throw new Error('invalid_request');
                }

                // 認可コードから認証情報を発行する
                const authorizationCodeRepo = new AuthorizationCodeRepo(req.redisClient);
                const result = await authorizationCode2token(basicUser.name, basicUser.pass, req.body.code, req.body.redirect_uri)(
                    authorizationCodeRepo, req.cognitoidentityserviceprovider
                );

                res.json(result.credentials);

                break;

            case 'refresh_token':
                if (basicUser === undefined) {
                    throw new Error('invalid_request');
                }

                await request.post({
                    simple: false,
                    resolveWithFullResponse: true,
                    json: true,
                    url: `${COGNITO_AUTHORIZE_SERVER_ENDPOINT}/token`,
                    auth: {
                        user: basicUser.name,
                        pass: basicUser.pass
                    },
                    form: req.body
                }).then((response: any) => {
                    debug('response recieved.', response.statusCode, response.body);

                    res.status(response.statusCode).json(response.body);
                });

                break;

            case 'client_credentials':
                // クライアント認証に関してはUIが存在しないので、Cognitoサービスの認可サーバーを使用すべし
                throw new Error('unsupported_grant_type');

            default:
                throw new Error('unsupported_grant_type');
        }
    } catch (error) {
        res.status(BAD_REQUEST).json({
            error: error.message
        });
    }
}

interface IAuthorizeResult {
    username: string;
    credentials: Express.ICredentials;
}

function authorizationCode2token(
    clientId: string,
    clientSecret: string,
    code: string,
    redirectUri: string
) {
    return async (authorizationCodeRepo: AuthorizationCodeRepo, cognitoidentityserviceprovider: CognitoIdentityServiceProvider) => {
        return new Promise<IAuthorizeResult>(async (resolve, reject) => {
            const authorizationData = await authorizationCodeRepo.findOne(code);
            debug('authorizationData found.', authorizationData);
            if (authorizationData.clientId !== clientId) {
                throw new Error('invalid_request');
            }

            if (authorizationData.redirectUri !== redirectUri) {
                throw new Error('invalid_request');
            }

            const hash = crypto.createHmac('sha256', clientSecret)
                .update(`${authorizationData.username}${clientId}`)
                .digest('base64');
            const params = {
                ClientId: clientId,
                AuthFlow: 'CUSTOM_AUTH',
                AuthParameters: {
                    USERNAME: authorizationData.username,
                    SECRET_HASH: hash
                }
            };

            cognitoidentityserviceprovider.initiateAuth(params, async (err, data) => {
                debug('initiateAuth result:', err, data);
                if (err instanceof Error) {
                    reject(err);
                } else {
                    if (data.AuthenticationResult === undefined) {
                        reject(new Error('unexpected error'));
                    } else {
                        await authorizationCodeRepo.remove(code);

                        resolve({
                            username: authorizationData.username,
                            credentials: {
                                access_token: <string>data.AuthenticationResult.AccessToken,
                                refresh_token: <string>data.AuthenticationResult.RefreshToken,
                                id_token: <string>data.AuthenticationResult.IdToken,
                                token_type: <string>data.AuthenticationResult.TokenType,
                                expires_in: <number>data.AuthenticationResult.ExpiresIn
                            }
                        });
                    }
                }
            });
        });
    };
}
