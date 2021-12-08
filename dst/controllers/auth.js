"use strict";
/**
 * 認証コントローラー
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
const crypto = require("crypto");
const createDebug = require("debug");
const querystring = require("querystring");
const uuid = require("uuid");
const CognitoError_1 = require("../models/CognitoError");
const authorizationCode_1 = require("../repos/authorizationCode");
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
function authorize(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        // 認証コード付与の場合、Amazon Cognito 認証サーバーは認証コードとステートを伴ってリダイレクトしアプリに戻ります。
        // コードとステートはフラグメントではなく、クエリ文字列パラメータで返される必要があります。
        // クエリ文字列はウェブリクエストの一部で、「?」文字の後に追加されます。この文字列には「&」文字で区切られたパラメータを 1 つ以上含めることができます。
        // フラグメントはウェブリクエストの一部で「#」文字の後に追加され、ドキュメントのサブセクションを指定します。
        // トークン付与の場合、
        // Amazon Cognito 認証サーバーはアクセストークンを伴ってリダイレクトしアプリに戻ります。
        // openid スコープがリクエストされなかったため、ID トークンは返されません。更新トークンがこのフローで返されることはありません。
        // トークンとステートはクエリ文字列ではなくフラグメントで返されます。
        try {
            yield validateRequest(req);
            // ログイン済であれば、認可コード発行へ
            const user = req.session.user;
            debug('login user:', user);
            if (user !== undefined) {
                yield returnAuthorizationCode(req, res, user.username, req.query.client_id, req.query.redirect_uri, req.query.state);
                return;
            }
            if (req.query.isReSignIn === '1') {
                // チケットページのドメイン取得
                // tslint:disable-next-line:no-magic-numbers
                const baseUrl = (req.query.redirect_uri).split('/').splice(0, 3).join('/');
                res.redirect(`${baseUrl}/#/auth/select`);
            }
            else {
                // ログインページへリダイレクト
                res.redirect(`/login?${querystring.stringify(req.query)}`);
            }
        }
        catch (error) {
            res.redirect(`/error?error=${error.message}&redirect_uri=${req.query.redirect_uri}`);
        }
    });
}
exports.authorize = authorize;
/**
 * ログイン
 * @param req Request
 * @param res Response
 */
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield validateRequest(req);
        }
        catch (error) {
            res.redirect(`/error?error=${error.message}&redirect_uri=${req.query.redirect_uri}`);
            return;
        }
        if (req.method === 'POST') {
            try {
                // usernameとpasswordを確認して認可コード生成
                const hash = crypto.createHmac('sha256', COGNITO_CLIENT_SECRET)
                    .update(`${req.body.username}${COGNITO_CLIENT_ID}`)
                    .digest('base64');
                yield new Promise((resolve, reject) => {
                    const params = {
                        UserPoolId: COGNITO_USER_POOL_ID,
                        ClientId: COGNITO_CLIENT_ID,
                        AuthFlow: 'ADMIN_NO_SRP_AUTH',
                        AuthParameters: {
                            USERNAME: req.body.username,
                            SECRET_HASH: hash,
                            PASSWORD: req.body.password
                        }
                    };
                    req.cognitoidentityserviceprovider.adminInitiateAuth(params, (err, data) => __awaiter(this, void 0, void 0, function* () {
                        debug('adminInitiateAuth result:', err, data);
                        if (err instanceof Error) {
                            reject(err);
                        }
                        else {
                            if (data.AuthenticationResult === undefined) {
                                reject(new Error('Unexpected.'));
                            }
                            else {
                                resolve();
                            }
                        }
                    }));
                });
                // ログイン状態を保管してリダイレクト先へ
                req.session.user = { username: req.body.username };
                yield returnAuthorizationCode(req, res, req.body.username, req.query.client_id, req.query.redirect_uri, req.query.state);
            }
            catch (error) {
                req.flash('errorMessage', new CognitoError_1.CognitoError(error).message);
                req.query.userName = req.body.username;
                res.redirect(`/login?${querystring.stringify(req.query)}`);
            }
        }
        else {
            // 非ログイン中でなければログインページへ
            res.render('login', {
                forgotPasswordUrl: `/forgotPassword?${querystring.stringify(req.query)}`,
                signupUrl: `/signup?${querystring.stringify(req.query)}`,
                userName: req.query.userName
            });
        }
    });
}
exports.login = login;
function returnAuthorizationCode(req, res, username, clientId, redirectUri, state) {
    return __awaiter(this, void 0, void 0, function* () {
        // 認可コードに保管すべき値は、ユーザーネーム、パスワード、クライアントID
        const code = uuid.v4();
        const authorizationRepo = new authorizationCode_1.RedisRepository(req.redisClient);
        yield authorizationRepo.save(code, {
            username: username,
            clientId: clientId,
            redirectUri: redirectUri
        });
        res.redirect(`${req.query.redirect_uri}?code=${code}&state=${state}`);
    });
}
function validateRequest(req) {
    return __awaiter(this, void 0, void 0, function* () {
        // 現時点で認可コード付与のみ対応
        if (req.query.response_type !== 'code') {
            throw new Error('Invalid response_type');
        }
        // redirect_uriが許可リストにあるかどうか確認
        yield new Promise((resolve, reject) => {
            req.cognitoidentityserviceprovider.describeUserPoolClient({
                UserPoolId: COGNITO_USER_POOL_ID,
                ClientId: req.query.client_id
            }, (err, data) => {
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
                }
                else {
                    reject(new Error('redirect_mismatch'));
                }
            });
        });
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
function logout(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (req.query.client_id === undefined) {
                throw new Error('Required String parameter \'client_id\' is not present');
            }
            if (req.query.logout_uri === undefined) {
                throw new Error('Required String parameter \'logout_uri\' is not present');
            }
            // redirect_uriが許可リストにあるかどうか確認
            yield new Promise((resolve, reject) => {
                req.cognitoidentityserviceprovider.describeUserPoolClient({
                    UserPoolId: COGNITO_USER_POOL_ID,
                    ClientId: req.query.client_id
                }, (err, data) => {
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
                    }
                    else {
                        reject(new Error('redirect_mismatch'));
                    }
                });
            });
            // ログアウトしてクライアントにリダイレクトして戻る
            delete req.session.user;
            res.redirect(req.query.logout_uri);
        }
        catch (error) {
            res.redirect(`/error?error=${error.message}&redirect_uri=${req.query.redirect_uri}`);
        }
    });
}
exports.logout = logout;
function userInfo(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let token;
            // トークン検出方法の指定がなければ、ヘッダーからBearerトークンを取り出す
            if (typeof req.headers.authorization === 'string' && req.headers.authorization.split(' ')[0] === 'Bearer') {
                token = req.headers.authorization.split(' ')[1];
            }
            if (typeof token !== 'string' || token.length === 0) {
                throw new Error('invalid_request');
            }
            const userInfoResult = yield new Promise((resolve, reject) => {
                req.cognitoidentityserviceprovider.getUser({ AccessToken: String(token) }, (err, data) => __awaiter(this, void 0, void 0, function* () {
                    if (err instanceof Error) {
                        reject(err);
                    }
                    else {
                        const result = {};
                        data.UserAttributes.forEach((a) => {
                            result[a.Name] = a.Value;
                        });
                        resolve(result);
                    }
                }));
            });
            res.json(userInfoResult);
        }
        catch (error) {
            res.redirect(`/error?error=${error.message}&redirect_uri=${req.query.redirect_uri}`);
        }
    });
}
exports.userInfo = userInfo;
