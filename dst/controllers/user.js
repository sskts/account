"use strict";
/**
 * ユーザーコントローラー
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
const createDebug = require("debug");
const querystring = require("querystring");
const debug = createDebug('sskts-account:controllers:user');
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
 * 会員登録フォーム
 */
function signup(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.method === 'POST') {
            try {
                const params = {
                    ClientId: COGNITO_CLIENT_ID,
                    Password: req.body.password,
                    Username: req.body.username,
                    UserAttributes: [
                        {
                            Name: 'family_name',
                            Value: req.body.family_name
                        },
                        {
                            Name: 'given_name',
                            Value: req.body.given_name
                        },
                        {
                            Name: 'email',
                            Value: req.body.email
                        },
                        {
                            Name: 'phone_number',
                            Value: req.body.phone_number
                        }
                    ]
                };
                const confirmParams = yield new Promise((resolve, reject) => {
                    req.cognitoidentityserviceprovider.signUp(params, (err, data) => {
                        debug('signUp response:', err, data);
                        if (err instanceof Error) {
                            reject(err);
                        }
                        else {
                            resolve({
                                username: req.body.username,
                                sub: data.UserSub,
                                destination: (data.CodeDeliveryDetails !== undefined) ? data.CodeDeliveryDetails.Destination : undefined,
                                deliveryMedium: (data.CodeDeliveryDetails !== undefined) ? data.CodeDeliveryDetails.DeliveryMedium : undefined
                            });
                        }
                    });
                });
                // 確認コード入力へ
                req.flash('confirmParams', JSON.stringify(confirmParams));
                res.redirect(`/confirm?${querystring.stringify(req.query)}`);
            }
            catch (error) {
                req.flash('errorMessage', error.message);
                res.redirect(`/signup?${querystring.stringify(req.query)}`);
            }
        }
        else {
            // 非ログイン中でなければログインページへ
            res.render('signup', {
                loginUrl: `/login?${querystring.stringify(req.query)}`
            });
        }
    });
}
exports.signup = signup;
/**
 * 会員登録確認コード確認フロー
 */
function confirm(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.method === 'POST') {
            try {
                yield new Promise((resolve, reject) => {
                    const params = {
                        ClientId: COGNITO_CLIENT_ID,
                        ConfirmationCode: req.body.code,
                        Username: req.body.username,
                        ForceAliasCreation: false
                        // SecretHash: 'STRING_VALUE'
                    };
                    req.cognitoidentityserviceprovider.confirmSignUp(params, (err, data) => {
                        if (err instanceof Error) {
                            reject(err);
                        }
                        else {
                            debug(data);
                            resolve();
                        }
                    });
                });
                // サインインして、認可フローへリダイレクト
                req.session.user = { username: req.body.username };
                res.redirect(`/authorize?${querystring.stringify(req.query)}`);
            }
            catch (error) {
                req.flash('errorMessage', error.message);
                req.flash('confirmParams', JSON.stringify({
                    username: req.body.username,
                    sub: req.body.sub,
                    destination: req.body.destination,
                    deliveryMedium: req.body.deliveryMedium
                }));
                res.redirect(`/confirm?${querystring.stringify(req.query)}`);
            }
        }
        else {
            try {
                const confirmParamsStr = req.flash('confirmParams');
                if (confirmParamsStr.length === 0) {
                    throw new Error('User cannot be confirmed, do not refresh the confirmation page.');
                }
                const confirmParams = JSON.parse(confirmParamsStr[0]);
                res.render('confirm', {
                    confirmParams: confirmParams,
                    resendcodeUrl: `/resendcode?${querystring.stringify(req.query)}`
                });
            }
            catch (error) {
                res.redirect(`/error?error=${error.message}`);
            }
        }
    });
}
exports.confirm = confirm;
/**
 * パスワード忘れフロー
 */
function forgotPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.method === 'POST') {
            try {
                const confirmForgotPasswordParams = yield new Promise((resolve, reject) => {
                    const params = {
                        ClientId: COGNITO_CLIENT_ID,
                        Username: req.body.username
                    };
                    req.cognitoidentityserviceprovider.forgotPassword(params, (err, data) => {
                        if (err instanceof Error) {
                            reject(err);
                        }
                        else {
                            debug(data);
                            resolve({
                                username: req.body.username,
                                destination: (data.CodeDeliveryDetails !== undefined) ? data.CodeDeliveryDetails.Destination : undefined,
                                deliveryMedium: (data.CodeDeliveryDetails !== undefined) ? data.CodeDeliveryDetails.DeliveryMedium : undefined
                            });
                        }
                    });
                });
                // 確認コード入力へ
                req.flash('confirmForgotPasswordParams', JSON.stringify(confirmForgotPasswordParams));
                res.redirect(`/confirmForgotPassword?${querystring.stringify(req.query)}`);
            }
            catch (error) {
                req.flash('errorMessage', error.message);
                res.redirect(`/forgotPassword?${querystring.stringify(req.query)}`);
            }
        }
        else {
            res.render('forgotPassword');
        }
    });
}
exports.forgotPassword = forgotPassword;
/**
 * パスワード忘れ確認フロー
 */
function confirmForgotPassword(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        if (req.method === 'POST') {
            try {
                yield new Promise((resolve, reject) => {
                    const params = {
                        ClientId: COGNITO_CLIENT_ID,
                        ConfirmationCode: req.body.code,
                        Username: req.body.username,
                        Password: req.body.password
                    };
                    req.cognitoidentityserviceprovider.confirmForgotPassword(params, (err, data) => {
                        debug('confirmForgotPassword response:', err, data);
                        if (err instanceof Error) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    });
                });
                // 認可フローへリダイレクト
                res.redirect(`/authorize?${querystring.stringify(req.query)}`);
            }
            catch (error) {
                req.flash('errorMessage', error.message);
                req.flash('confirmForgotPasswordParams', JSON.stringify({
                    username: req.body.username,
                    destination: req.body.destination,
                    deliveryMedium: req.body.deliveryMedium
                }));
                res.redirect(`/confirmForgotPassword?${querystring.stringify(req.query)}`);
            }
        }
        else {
            try {
                const confirmForgotPasswordParamsStr = req.flash('confirmForgotPasswordParams');
                if (confirmForgotPasswordParamsStr.length === 0) {
                    throw new Error('Password cannot be reset, do not refresh the password reset page.');
                }
                const confirmForgotPasswordParams = JSON.parse(confirmForgotPasswordParamsStr[0]);
                res.render('confirmForgotPassword', {
                    confirmForgotPasswordParams: confirmForgotPasswordParams,
                    confirmUrl: `/confirm?${querystring.stringify(req.query)}`,
                    resendcodeUrl: `/resendcode?${querystring.stringify(req.query)}`
                });
            }
            catch (error) {
                res.redirect(`/error?error=${error.message}`);
            }
        }
    });
}
exports.confirmForgotPassword = confirmForgotPassword;
