/**
 * ユーザーコントローラー
 */

import * as  crypto from 'crypto';
import * as  createDebug from 'debug';
import * as express from 'express';
import * as libphonenumber from 'google-libphonenumber';
import * as querystring from 'querystring';
import { CognitoError } from '../models/CognitoError';

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
const COGNITO_CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET;
if (COGNITO_CLIENT_SECRET === undefined) {
    throw new Error('Environment variable `COGNITO_CLIENT_SECRET` required.');
}

/**
 * メールアドレス確認に必要なパラメーターインターフェース
 */
interface IConfirmParams {
    username: string;
    sub: string;
    destination?: string;
    deliveryMedium?: string;
}

/**
 * 会員登録フォーム
 */
// tslint:disable-next-line:max-func-body-length
export async function signup(req: express.Request, res: express.Response) {
    if (req.method === 'POST') {
        debug('signup:post', req.body);
        try {
            console.log(req.body.form);
            req.body.birthdate = req.body.birthdate_year + "-" + req.body.birthdate_month + "-" + req.body.birthdate_day;
            signupValidation(req);
            const validationResult = await req.getValidationResult();
            debug(validationResult.array());
            if (!validationResult.isEmpty()) {
                const validationErrorMessage = validationResult
                    .array()
                    .map((error) => `・${error.msg}`)
                    .join('<br>');
                req.flash('validationErrorMessage', validationErrorMessage);
                res.render('signup', {
                    loginUrl: `/login?${querystring.stringify(req.query)}`,
                    form: req.body
                });

                return;
            }
            const hash = crypto.createHmac('sha256', <string>COGNITO_CLIENT_SECRET)
                .update(`${req.body.username}${COGNITO_CLIENT_ID}`)
                .digest('base64');
            const params = {
                ClientId: <string>COGNITO_CLIENT_ID,
                SecretHash: hash,
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
                        Value: phoneNumberFormat(req.body.phone_number)
                    },
                    {
                        Name: 'gender',
                        Value: req.body.gender
                    },
                    {
                        Name: 'birthdate',
                        Value: req.body.birthdate
                    },
                    {
                        Name: 'custom:postalCode',
                        Value: req.body.postalCode
                    }
                ]
            };

            const confirmParams = await new Promise<IConfirmParams>((resolve, reject) => {
                req.cognitoidentityserviceprovider.signUp(params, (err, data) => {
                    debug('signUp response:', err, data);
                    if (err instanceof Error) {
                        reject(err);
                    } else {
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
            req.flash('confirmParams', <any>confirmParams);
            res.redirect(`/confirm?${querystring.stringify(req.query)}`);
        } catch (error) {
            req.flash('errorMessage', new CognitoError(error).message);
            res.render('signup', {
                loginUrl: `/login?${querystring.stringify(req.query)}`,
                form: req.body
            });
        }
    } else {

        const thirtyFiveYearsOld = ((new Date()).getFullYear() - 35) + '';
        // debug('signup input', req.body);
        const form = {
            username: '',
            family_name: '',
            given_name: '',
            email: '',
            phone_number: '',
            birthdate: '',
            birthdate_year: thirtyFiveYearsOld,
            birthdate_month: '01',
            birthdate_day: '01',
            gender: '0',
            postalCode: '',
            password: ''
        };
        // 非ログイン中でなければログインページへ
        res.render('signup', {
            loginUrl: `/login?${querystring.stringify(req.query)}`,
            form: form
        });
    }
}

/**
 * 会員登録検証
 */
function signupValidation(req: express.Request) {
    const NAME_MAX_LENGTH = 12;
    const USER_NAME_MAX_LENGTH = 30;
    const USER_NAME_MIN_LENGTH = 6;
    // ユーザーネーム
    req.checkBody('username', 'ユーザーネームが未入力です').notEmpty();
    req.checkBody('username', 'ユーザーネームは英数字で入力してください').matches(/^[A-Za-z0-9]*$/);
    req.checkBody('username', `ユーザーネームは${USER_NAME_MIN_LENGTH}文字以上${USER_NAME_MAX_LENGTH}文字以内で入力してください`).isLength({
        min: USER_NAME_MIN_LENGTH,
        max: USER_NAME_MAX_LENGTH
    });
    // req.checkBody('username', 'ユーザーネームが未入力です').notEmpty();
    // セイ
    req.checkBody('family_name', 'セイが未入力です').notEmpty();
    req.checkBody('family_name', 'セイは全角カタカナで入力してください').matches(/^[ァ-ヶー]+$/);
    req.checkBody('family_name', `セイは${NAME_MAX_LENGTH}文字以内で入力してください`).isLength({
        min: 0,
        max: NAME_MAX_LENGTH
    });
    // メイ
    req.checkBody('given_name', 'メイが未入力です').notEmpty();
    req.checkBody('given_name', 'メイは全角カタカナで入力してください').matches(/^[ァ-ヶー]+$/);
    req.checkBody('family_name', `メイは${NAME_MAX_LENGTH}文字以内で入力してください`).isLength({
        min: 0,
        max: NAME_MAX_LENGTH
    });
    // メールアドレス
    req.checkBody('email', 'メールアドレスが未入力です').notEmpty();
    req.checkBody('email', 'メールアドレスの形式が正しくありません').isEmail();
    // 電話番号
    req.checkBody('phone_number', '電話番号が未入力です').notEmpty();
    (<any>req.checkBody('phone_number', '電話番号の形式が正しくありません')).custom((value: string) => {
        if (value === '') {
            return false;
        }
        const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
        const parsePhoneNumber = phoneUtil.parseAndKeepRawInput(value, 'JP');

        return phoneUtil.isValidNumber(parsePhoneNumber);
    });
    // 郵便番号
    req.checkBody('postalCode', '郵便番号が未入力です').notEmpty();
    req.checkBody('postalCode', '郵便番号の形式が正しくありません').matches(/^\d{7}$/);
    // 性別
    // req.checkBody('gender', '性別が未選択です').notEmpty();
    // 生年月日
    //req.checkBody('birthdate', '生年月日が未入力です').notEmpty();
    (<any>req.checkBody('birthdate', '日付が正しくありません')).custom((birthdate: string) => {
        return validDate(birthdate);
    });
}

/**
 * 日付確認
 */
function validDate(date : string) : boolean{
    var d = date.split("-")
    const year = parseInt(d[0]);
    const month = parseInt(d[1]);
    const day = parseInt(d[2]);
    const dt = new Date(year, month - 1, day);
    return (dt.getFullYear()==year && dt.getMonth()==month-1 && dt.getDate()==day);
}

/**
 * 電話番号フォーマット
 */
function phoneNumberFormat(phoneNumber: string) {
    const phoneUtil = libphonenumber.PhoneNumberUtil.getInstance();
    const parsePhoneNumber = phoneUtil.parseAndKeepRawInput(phoneNumber, 'JP');

    return phoneUtil.format(parsePhoneNumber, libphonenumber.PhoneNumberFormat.E164);
}

/**
 * 会員登録確認コード確認フロー
 */
export async function confirm(req: express.Request, res: express.Response) {
    if (req.method === 'POST') {
        try {
            await new Promise<void>((resolve, reject) => {
                const hash = crypto.createHmac('sha256', <string>COGNITO_CLIENT_SECRET)
                    .update(`${req.body.username}${COGNITO_CLIENT_ID}`)
                    .digest('base64');
                const params = {
                    ClientId: <string>COGNITO_CLIENT_ID,
                    SecretHash: hash,
                    ConfirmationCode: req.body.code,
                    Username: req.body.username,
                    ForceAliasCreation: false
                };
                req.cognitoidentityserviceprovider.confirmSignUp(params, (err, data) => {
                    if (err instanceof Error) {
                        reject(err);
                    } else {
                        debug(data);
                        resolve();
                    }
                });
            });

            // サインインして、認可フローへリダイレクト
            (<Express.Session>req.session).user = { username: req.body.username };
            res.redirect(`/authorize?${querystring.stringify(req.query)}`);
        } catch (error) {
            req.flash('errorMessage', new CognitoError(error).message);
            req.flash('confirmParams', <any>{
                username: req.body.username,
                sub: req.body.sub,
                destination: req.body.destination,
                deliveryMedium: req.body.deliveryMedium
            });
            res.redirect(`/confirm?${querystring.stringify(req.query)}`);
        }
    } else {
        try {
            const confirmParams = <IConfirmParams>req.flash('confirmParams')[0];
            res.render('confirm', {
                confirmParams: confirmParams,
                resendcodeUrl: `/resendcode?${querystring.stringify(req.query)}`
            });
        } catch (error) {
            res.redirect(`/error?error=${error.message}&redirect_uri=${req.query.redirect_uri}`);
        }
    }
}

/**
 * メールアドレス確認に必要なパラメーターインターフェース
 */
interface IConfirmForgotPasswordParams {
    username: string;
    destination?: string;
    deliveryMedium?: string;
}

/**
 * パスワード忘れフロー
 */
export async function forgotPassword(req: express.Request, res: express.Response) {
    if (req.method === 'POST') {
        try {
            const confirmForgotPasswordParams = await new Promise<IConfirmForgotPasswordParams>((resolve, reject) => {
                const hash = crypto.createHmac('sha256', <string>COGNITO_CLIENT_SECRET)
                    .update(`${req.body.username}${COGNITO_CLIENT_ID}`)
                    .digest('base64');
                const params = {
                    ClientId: <string>COGNITO_CLIENT_ID,
                    SecretHash: hash,
                    Username: req.body.username
                };
                req.cognitoidentityserviceprovider.forgotPassword(params, (err, data) => {
                    debug('forgotPassword response', err, data);
                    if (err instanceof Error) {
                        reject(err);
                    } else {
                        resolve({
                            username: req.body.username,
                            destination: (data.CodeDeliveryDetails !== undefined) ? data.CodeDeliveryDetails.Destination : undefined,
                            deliveryMedium: (data.CodeDeliveryDetails !== undefined) ? data.CodeDeliveryDetails.DeliveryMedium : undefined
                        });
                    }
                });
            });

            // 確認コード入力へ
            req.flash('confirmForgotPasswordParams', <any>confirmForgotPasswordParams);
            res.redirect(`/confirmForgotPassword?${querystring.stringify(req.query)}`);
        } catch (error) {
            req.flash('errorMessage', new CognitoError(error).message);
            res.redirect(`/forgotPassword?${querystring.stringify(req.query)}`);
        }
    } else {
        res.render('forgotPassword');
    }
}

/**
 * パスワード忘れ確認フロー
 */
export async function confirmForgotPassword(req: express.Request, res: express.Response) {
    if (req.method === 'POST') {
        try {
            // validation
            if (req.body.password !== req.body.confirmPassword) {
                throw { code: 'PasswordMismatchException' };
            }

            await new Promise<void>((resolve, reject) => {
                const hash = crypto.createHmac('sha256', <string>COGNITO_CLIENT_SECRET)
                    .update(`${req.body.username}${COGNITO_CLIENT_ID}`)
                    .digest('base64');
                const params = {
                    ClientId: <string>COGNITO_CLIENT_ID,
                    SecretHash: hash,
                    ConfirmationCode: req.body.code,
                    Username: req.body.username,
                    Password: req.body.password
                };
                req.cognitoidentityserviceprovider.confirmForgotPassword(params, (err, data) => {
                    debug('confirmForgotPassword response:', err, data);
                    if (err instanceof Error) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            // 認可フローへリダイレクト
            res.redirect(`/authorize?${querystring.stringify(req.query)}`);
        } catch (error) {
            req.flash('errorMessage', new CognitoError(error).message);
            req.flash('confirmForgotPasswordParams', <any>{
                username: req.body.username,
                destination: req.body.destination,
                deliveryMedium: req.body.deliveryMedium
            });
            res.redirect(`/confirmForgotPassword?${querystring.stringify(req.query)}`);
        }
    } else {
        try {
            const confirmForgotPasswordParams = <IConfirmParams>req.flash('confirmForgotPasswordParams')[0];
            res.render('confirmForgotPassword', {
                confirmForgotPasswordParams: confirmForgotPasswordParams,
                confirmUrl: `/confirm?${querystring.stringify(req.query)}`,
                resendcodeUrl: `/resendcode?${querystring.stringify(req.query)}`
            });
        } catch (error) {
            res.redirect(`/error?error=${error.message}&redirect_uri=${req.query.redirect_uri}`);
        }
    }
}
