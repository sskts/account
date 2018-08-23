/**
 * 認証コントローラー
 */

import * as  crypto from 'crypto';
import * as  createDebug from 'debug';
import * as express from 'express';
import * as querystring from 'querystring';
import * as uuid from 'uuid';

import { CognitoError } from '../models/CognitoError';
import { RedisRepository as AuthorizationCodeRepo } from '../repos/authorizationCode';

const debug = createDebug('sskts-account:controllers:auth');

const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
if (COGNITO_USER_POOL_ID === undefined) {
    throw new Error('Environment variable `COGNITO_USER_POOL_ID` required.');
}
const COGNITO_CLIENT_ID = process.env.COGNITO_CLIENT_ID;
if (COGNITO_CLIENT_ID === undefined) {
    throw new Error('Environment variable `COGNITO_CLIENT_ID` required.');
}
const COGNITO_CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET;
if (COGNITO_CLIENT_SECRET === undefined) {
    throw new Error('Environment variable `COGNITO_CLIENT_SECRET` required.');
}

/**
 * 認証エンドポイント
 * /oauth2/authorize エンドポイントは HTTPS GET のみをサポートします。
 * ユーザープールクライアントは、通常このリクエストをシステムブラウザ経由で行います。
 * 通常は Android の Custom Chrome Tab や iOS の Safari View Control です。
 *
 * リクエストパラメータ
 * @param req.query.response_type レスポンスのタイプ。code または token を指定する必要があります。
 * クライアントがエンドユーザーの認証コードを求めるか (認証コード付与フロー)、エンドユーザーに直接トークンを発行するか (暗黙的フロー) を示します。
 * 必須
 * @param req.query.client_id クライアント ID。ユーザープール事前登録されたクライアントである必要があり、フェデレーションが有効になっている必要があります。
 * 必須
 * @param req.query.redirect_uri 認証がユーザーに付与された後、認証サーバーによってブラウザがリダイレクトされる URL です。事前にクライアントに登録されている必要があります。
 * 必須
 * @param [req.query.state] クライアントが初期リクエストに追加する OPAQUE 値。認証サーバーはクライアントにリダイレクトして戻るときに、この値を含めます。
 * この値は、CSRF 攻撃を防ぐために、クライアントで使用する必要があります。オプションですが、強くお勧めします。
 * @param [req.query.scope] クライアントに関連付けられた任意のシステム予約されたスコープまたはカスタムスコープを組み合わせることができます。スコープはスペースで区切る必要があります。
 * システム予約されたスコープは openid、email、phone、profile、および aws.cognito.signin.user.admin です。使用するスコープはクライアントにあらかじめ関連付けられている必要があります。
 * これを行わない場合、実行時に無視されます。クライアントがスコープをリクエストしない場合、認証サーバーはクライアントに関連付けられているすべてのスコープを使用します。
 * @param [req.query.code_challenge_method] チャレンジを生成するために使用されるメソッドです。
 * PKCE RFC では S256 および plain の 2 つのメソッドが定義されていますが、Amazon Cognito 認証サーバーでは S256 のみがサポートされています。
 * @param [req.query.code_challenge] code_verifier から生成されたチャレンジ。code_challenge_method が指定された場合にのみ必須です。
 */
export async function authorize(req: express.Request, res: express.Response) {
    // 認証コード付与の場合、Amazon Cognito 認証サーバーは認証コードとステートを伴ってリダイレクトしアプリに戻ります。
    // コードとステートはフラグメントではなく、クエリ文字列パラメータで返される必要があります。
    // クエリ文字列はウェブリクエストの一部で、「?」文字の後に追加されます。この文字列には「&」文字で区切られたパラメータを 1 つ以上含めることができます。
    // フラグメントはウェブリクエストの一部で「#」文字の後に追加され、ドキュメントのサブセクションを指定します。

    // トークン付与の場合、
    // Amazon Cognito 認証サーバーはアクセストークンを伴ってリダイレクトしアプリに戻ります。
    // openid スコープがリクエストされなかったため、ID トークンは返されません。更新トークンがこのフローで返されることはありません。
    // トークンとステートはクエリ文字列ではなくフラグメントで返されます。

    try {
        await validateRequest(req);

        // ログイン済であれば、認可コード発行へ
        const user = (<Express.Session>req.session).user;
        debug('login user:', user);
        if (user !== undefined) {
            await returnAuthorizationCode(req, res, user.username, req.query.client_id, req.query.redirect_uri, req.query.state);

            return;
        }

        // ログインページへリダイレクト
        res.redirect(`/login?${querystring.stringify(req.query)}`);
    } catch (error) {
        res.redirect(`/error?error=${error.message}&redirect_uri=${req.query.redirect_uri}`);
    }
}

/**
 * ログイン
 * @param req Request
 * @param res Response
 */
export async function login(req: express.Request, res: express.Response) {
    try {
        await validateRequest(req);
    } catch (error) {
        res.redirect(`/error?error=${error.message}&redirect_uri=${req.query.redirect_uri}`);

        return;
    }

    if (req.method === 'POST') {
        try {
            // usernameとpasswordを確認して認可コード生成
            const hash = crypto.createHmac('sha256', <string>COGNITO_CLIENT_SECRET)
                .update(`${req.body.username}${COGNITO_CLIENT_ID}`)
                .digest('base64');
            await new Promise<string>((resolve, reject) => {
                const params = {
                    UserPoolId: <string>COGNITO_USER_POOL_ID,
                    ClientId: <string>COGNITO_CLIENT_ID,
                    AuthFlow: 'ADMIN_NO_SRP_AUTH',
                    AuthParameters: {
                        USERNAME: req.body.username,
                        SECRET_HASH: hash,
                        PASSWORD: req.body.password
                    }
                };

                req.cognitoidentityserviceprovider.adminInitiateAuth(params, async (err, data) => {
                    debug('adminInitiateAuth result:', err, data);
                    if (err instanceof Error) {
                        reject(err);
                    } else {
                        if (data.AuthenticationResult === undefined) {
                            reject(new Error('Unexpected.'));
                        } else {
                            resolve();
                        }
                    }
                });
            });

            // ログイン状態を保管してリダイレクト先へ
            (<Express.Session>req.session).user = { username: req.body.username };
            await returnAuthorizationCode(req, res, req.body.username, req.query.client_id, req.query.redirect_uri, req.query.state);
        } catch (error) {
            req.flash('errorMessage', new CognitoError(error).message);
            res.redirect(`/login?${querystring.stringify(req.query)}`);
        }
    } else {
        // 非ログイン中でなければログインページへ
        res.render('login', {
            forgotPasswordUrl: `/forgotPassword?${querystring.stringify(req.query)}`,
            signupUrl: `/signup?${querystring.stringify(req.query)}`
        });
    }
}

async function returnAuthorizationCode(
    req: express.Request,
    res: express.Response,
    username: string,
    clientId: string,
    redirectUri: string,
    state: string
) {
    // 認可コードに保管すべき値は、ユーザーネーム、パスワード、クライアントID
    const code = uuid.v4();
    const authorizationRepo = new AuthorizationCodeRepo(req.redisClient);
    await authorizationRepo.save(code, {
        username: username,
        clientId: clientId,
        redirectUri: redirectUri
    });

    res.redirect(`${req.query.redirect_uri}?code=${code}&state=${state}`);
}

async function validateRequest(req: express.Request) {
    // 現時点で認可コード付与のみ対応
    if (req.query.response_type !== 'code') {
        throw new Error('Invalid response_type');
    }

    // redirect_uriが許可リストにあるかどうか確認
    await new Promise((resolve, reject) => {
        req.cognitoidentityserviceprovider.describeUserPoolClient(
            {
                UserPoolId: <string>COGNITO_USER_POOL_ID,
                ClientId: req.query.client_id
            },
            (err, data) => {
                debug('describeUserPoolClient result:', err, data);
                if (err instanceof Error) {
                    reject(err);

                    return;
                }

                const userPoolClient = data.UserPoolClient;
                if (userPoolClient === undefined) {
                    reject(new Error(`User pool client ${req.query.client_id} does not exist.`));

                    return;
                }

                if (Array.isArray(userPoolClient.CallbackURLs) && userPoolClient.CallbackURLs.indexOf(req.query.redirect_uri) >= 0) {
                    resolve();
                } else {
                    reject(new Error('redirect_mismatch'));
                }
            }
        );
    });
}

/**
 * /logout エンドポイントはユーザーをサインアウトさせます。
 * /logout エンドポイントは HTTPS GET のみをサポートします。
 * ユーザープールクライアントは、通常このリクエストをシステムブラウザ経由で行います。通常は Android の Custom Chrome Tab や iOS の Safari View Control です。
 *
 * リクエストパラメータ
 * @param req.query.client_id
 * アプリのアプリクライアント ID。アプリクライアント ID を取得するには、ユーザープールにアプリを登録する必要があります。
 * 詳細については、「ユーザープールアプリ設定の指定」を参照してください。
 * @see https://docs.aws.amazon.com/ja_jp/cognito/latest/developerguide/user-pool-settings-client-apps.html
 *
 * @param req.query.logout_uri
 * クライアントアプリに登録されたサインアウト URL。詳細については、「ユーザープールアプリの ID プロバイダ設定を指定する」を参照してください。
 * @see https://docs.aws.amazon.com/ja_jp/cognito/latest/developerguide/cognito-user-pools-app-idp-settings.html
 */
export async function logout(req: express.Request, res: express.Response) {
    try {
        if (req.query.client_id === undefined) {
            throw new Error('Required String parameter \'client_id\' is not present');
        }
        if (req.query.logout_uri === undefined) {
            throw new Error('Required String parameter \'logout_uri\' is not present');
        }

        // redirect_uriが許可リストにあるかどうか確認
        await new Promise((resolve, reject) => {
            req.cognitoidentityserviceprovider.describeUserPoolClient(
                {
                    UserPoolId: <string>COGNITO_USER_POOL_ID,
                    ClientId: req.query.client_id
                },
                (err, data) => {
                    debug('describeUserPoolClient result:', err, data);
                    if (err instanceof Error) {
                        reject(err);

                        return;
                    }

                    const userPoolClient = data.UserPoolClient;
                    if (userPoolClient === undefined) {
                        reject(new Error(`User pool client ${req.query.client_id} does not exist.`));

                        return;
                    }

                    if (Array.isArray(userPoolClient.LogoutURLs) && userPoolClient.LogoutURLs.indexOf(req.query.logout_uri) >= 0) {
                        resolve();
                    } else {
                        reject(new Error('redirect_mismatch'));
                    }
                }
            );
        });

        // ログアウトしてクライアントにリダイレクトして戻る
        delete (<Express.Session>req.session).user;
        res.redirect(req.query.logout_uri);
    } catch (error) {
        res.redirect(`/error?error=${error.message}&redirect_uri=${req.query.redirect_uri}`);
    }
}
