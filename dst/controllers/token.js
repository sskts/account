"use strict";
/**
 * トークンコントローラー
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const basicAuth = require("basic-auth");
const crypto = require("crypto");
const createDebug = require("debug");
const http_status_1 = require("http-status");
const request = require("request-promise-native");
const authorizationCode_1 = require("../repos/authorizationCode");
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
function generate(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        debug('getting token...', req.body);
        try {
            const basicUser = basicAuth(req);
            switch (req.body.grant_type) {
                case 'authorization_code':
                    if (basicUser === undefined) {
                        throw new Error('invalid_request');
                    }
                    // 認可コードから認証情報を発行する
                    const authorizationCodeRepo = new authorizationCode_1.RedisRepository(req.redisClient);
                    const result = yield authorizationCode2token(basicUser.name, basicUser.pass, req.body.code, req.body.redirect_uri)(authorizationCodeRepo, req.cognitoidentityserviceprovider);
                    res.json(result.credentials);
                    break;
                case 'refresh_token':
                    if (basicUser === undefined) {
                        throw new Error('invalid_request');
                    }
                    yield request.post({
                        simple: false,
                        resolveWithFullResponse: true,
                        json: true,
                        url: `${COGNITO_AUTHORIZE_SERVER_ENDPOINT}/token`,
                        auth: {
                            user: basicUser.name,
                            pass: basicUser.pass
                        },
                        form: req.body
                    }).then((response) => {
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
        }
        catch (error) {
            res.status(http_status_1.BAD_REQUEST).json({
                error: error.message
            });
        }
    });
}
exports.generate = generate;
function authorizationCode2token(clientId, clientSecret, code, redirectUri) {
    return (authorizationCodeRepo, cognitoidentityserviceprovider) => __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            const authorizationData = yield authorizationCodeRepo.findOne(code);
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
            cognitoidentityserviceprovider.initiateAuth(params, (err, data) => __awaiter(this, void 0, void 0, function* () {
                debug('initiateAuth result:', err, data);
                if (err instanceof Error) {
                    reject(err);
                }
                else {
                    if (data.AuthenticationResult === undefined) {
                        reject(new Error('unexpected error'));
                    }
                    else {
                        yield authorizationCodeRepo.remove(code);
                        resolve({
                            username: authorizationData.username,
                            credentials: {
                                access_token: data.AuthenticationResult.AccessToken,
                                refresh_token: data.AuthenticationResult.RefreshToken,
                                id_token: data.AuthenticationResult.IdToken,
                                token_type: data.AuthenticationResult.TokenType,
                                expires_in: data.AuthenticationResult.ExpiresIn
                            }
                        });
                    }
                }
            }));
        }));
    });
}
