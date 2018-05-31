/**
 * エラー一覧
 */
import * as  createDebug from 'debug';
const debug = createDebug('sskts-account:CognitoError');

// tslint:disable:max-line-length
const errors = [
    {
        code: 'InternalErrorException',
        message: {
            en: '',
            ja: 'エラーが発生しました。'
        },
        description: {
            en: 'This exception is thrown when Amazon Cognito encounters an internal error.',
            ja: 'この例外は、Amazon Cognitoが内部エラーに遭遇したときにスローされます。'
        },
        statusCode: 500
    },
    {
        code: 'InvalidLambdaResponseException',
        message: {
            en: '',
            ja: 'エラーが発生しました。'
        },
        description: {
            en: 'This exception is thrown when the Amazon Cognito service encounters an invalid AWS Lambda response.',
            ja: 'この例外は、Amazon Cognitoサービスが無効なAWSラムダ応答に遭遇したときにスローされます。'
        },
        statusCode: 400
    },
    {
        code: 'InvalidParameterException',
        message: {
            en: '',
            ja: 'パラメータが無効です。'
        },
        description: {
            en: 'This exception is thrown when the Amazon Cognito service encounters an invalid parameter.',
            ja: 'この例外は、Amazon Cognitoサービスが無効なパラメータに遭遇したときにスローされます。'
        },
        statusCode: 400
    },
    {
        code: 'InvalidSmsRoleAccessPolicyException',
        message: {
            en: '',
            ja: 'エラーが発生しました。'
        },
        description: {
            en: 'This exception is returned when the role provided for SMS configuration does not have permission to publish using Amazon SNS.',
            ja: 'この例外は、SMS構成に提供されたロールにAmazon SNSを使用してパブリッシュする権限がない場合に返されます。'
        },
        statusCode: 400
    },
    {
        code: 'InvalidSmsRoleTrustRelationshipException',
        message: {
            en: '',
            ja: 'エラーが発生しました。'
        },
        description: {
            en: 'This exception is thrown when the trust relationship is invalid for the role provided for SMS configuration. This can happen if you do not trust cognito-idp.amazonaws.com or the external ID provided in the role does not match what is provided in the SMS configuration for the user pool.',
            ja: 'この例外は、SMS構成に提供されたロールに対して信頼関係が無効な場合にスローされます。これは、cognito - idp.amazonaws.comを信頼しない場合、またはロール内で提供された外部IDが、ユーザプールのSMS設定で提供されているIDと一致しない場合に発生します。'
        },
        statusCode: 400
    },
    {
        code: 'InvalidUserPoolConfigurationException',
        message: {
            en: '',
            ja: 'エラーが発生しました。'
        },
        description: {
            en: 'This exception is thrown when the user pool configuration is invalid.',
            ja: 'この例外は、ユーザープール構成が無効な場合にスローされます。'
        },
        statusCode: 400
    },
    {
        code: 'MFAMethodNotFoundException',
        message: {
            en: '',
            ja: 'マルチファクタ認証（MFA）メソッドを検出できません。'
        },
        description: {
            en: 'This exception is thrown when Amazon Cognito cannot find a multi-factor authentication (MFA) method.',
            ja: 'この例外は、Amazon Cognitoがマルチファクタ認証（MFA）メソッドを検出できない場合にスローされます。'
        },
        statusCode: 400
    },
    {
        code: 'NotAuthorizedException',
        message: {
            en: '',
            ja: 'ユーザーネームまたはパスワードが違います。'
        },
        description: {
            en: 'This exception is thrown when a user is not authorized.',
            ja: 'この例外は、ユーザーが承認されていない場合にスローされます。'
        },
        statusCode: 400
    },
    {
        code: 'PasswordResetRequiredException',
        message: {
            en: '',
            ja: 'パスワードのリセットが必要です。'
        },
        description: {
            en: 'This exception is thrown when a password reset is required.',
            ja: 'この例外は、パスワードのリセットが必要な場合にスローされます。'
        },
        statusCode: 400
    },
    {
        code: 'ResourceNotFoundException',
        message: {
            en: '',
            ja: '要求されたリソースがありません。'
        },
        description: {
            en: 'This exception is thrown when the Amazon Cognito service cannot find the requested resource.',
            ja: 'この例外は、Amazon Cognitoサービスが要求されたリソースを見つけることができない場合にスローされます。'
        },
        statusCode: 400
    },
    {
        code: 'TooManyRequestsException',
        message: {
            en: '',
            ja: 'エラーが発生しました。'
        },
        description: {
            en: 'This exception is thrown when the Amazon Cognito service cannot find the requested resource.',
            ja: 'この例外は、ユーザーが所定の操作に対して要求した回数が多すぎる場合にスローされます。'
        },
        statusCode: 400
    },
    {
        code: 'UnexpectedLambdaException',
        message: {
            en: '',
            ja: 'エラーが発生しました。'
        },
        description: {
            en: 'This exception is thrown when the user has made too many requests for a given operation.',
            ja: 'この例外は、Amazon CognitoサービスがAWSラムダサービスとの予期しない例外を検出した場合にスローされます。'
        },
        statusCode: 400
    },
    {
        code: 'UserLambdaValidationException',
        message: {
            en: '',
            ja: 'エラーが発生しました。'
        },
        description: {
            en: 'This exception is thrown when the Amazon Cognito service encounters an unexpected exception with the AWS Lambda service.',
            ja: 'この例外は、Amazon CognitoサービスがAWSラムダサービスでユーザ検証例外を検出した場合にスローされます。'
        },
        statusCode: 400
    },
    {
        code: 'UserNotConfirmedException',
        message: {
            en: '',
            ja: 'エラーが発生しました。'
        },
        description: {
            en: 'This exception is thrown when a user is not confirmed successfully.',
            ja: 'この例外は、ユーザーが正常に確認されなかった場合にスローされます。'
        },
        statusCode: 400
    },
    {
        code: 'UserNotFoundException',
        message: {
            en: '',
            ja: 'ユーザーが見つかりません。'
        },
        description: {
            en: 'This exception is thrown when a user is not found.',
            ja: 'この例外は、ユーザーが見つからない場合にスローされます。'
        },
        statusCode: 400
    },
    {
        code: 'CodeMismatchException',
        message: {
            en: '',
            ja: '認証コードが無効です。もう一度お試しください。'
        },
        description: {
            en: 'This exception is thrown if the provided code does not match what the server was expecting.',
            ja: 'この例外は、指定されたコードがサーバーが予期していたものと一致しない場合にスローされます。'
        },
        statusCode: 400
    },
    {
        code: 'UsernameExistsException',
        message: {
            en: 'User already exists',
            ja: 'このユーザーは既に存在します'
        },
        description: {
            en: '',
            ja: ''
        },
        statusCode: 400
    },
    {
        code: 'PasswordMismatchException',
        message: {
            en: '',
            ja: 'パスワードが確認パスワードと一致しません。'
        },
        description: {
            en: '',
            ja: ''
        },
        statusCode: 400
    }
];

/**
 * Amazon Cognitoエラー
 */
export class CognitoError {

    public code: string;
    public statusCode: number;
    public message: string;

    constructor(err: any) {
        this.code = err.code;
        this.statusCode = err.statusCode;
        debug('error.code', this.code);
        const error = errors.find((target) => {
            return (target.code === err.code);
        });
        if (error === undefined) {
            this.message = err.message;
        } else {
            this.message = `${error.message.ja}`;
            this.statusCode = error.statusCode;
        }
    }
}
