const AWS = require('aws-sdk');
const crypto = require('crypto');

const REGION = process.env.COGNITO_REGION;
const userPoolId = process.env.COGNITO_USER_POOL_ID;
const clientId = process.env.COGNITO_CLIENT_ID;
const clientSecret = process.env.COGNITO_CLIENT_SECRET;

const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({
    apiVersion: 'latest',
    region: REGION,
    // accessKeyId: accessKeyId,
    // secretAccessKey: secretAccessKey
});

const username = 'ilovegadd';

async function main() {
    const hash = crypto.createHmac('sha256', clientSecret)
        .update(`${username}${clientId}`)
        .digest('base64');
    const params = {
        // UserPoolId: userPoolId, // 認可サイトは1ユーザープールにつき1サイトであるから、環境変数で設定
        ClientId: clientId,
        AuthFlow: 'CUSTOM_AUTH',
        AuthParameters: {
            USERNAME: username,
            SECRET_HASH: hash
        }
        // ClientMetadata?: ClientMetadataType;
        // AnalyticsMetadata?: AnalyticsMetadataType;
        // ContextData?: ContextDataType;
    };

    cognitoidentityserviceprovider.initiateAuth(params, (err, data) => {
        console.log('initiateAuth result:', err, data);
        if (err instanceof Error) {
            console.error(err);
        } else {
            if (data.AuthenticationResult === undefined) {
                console.error(new Error('Unexpected.'));
            } else {
                console.log({
                    accessToken: data.AuthenticationResult.AccessToken,
                    expiresIn: data.AuthenticationResult.ExpiresIn,
                    idToken: data.AuthenticationResult.IdToken,
                    refreshToken: data.AuthenticationResult.RefreshToken,
                    tokenType: data.AuthenticationResult.TokenType
                });
            }
        }
    });
}

main().then(() => {
    console.log('success!');
});
