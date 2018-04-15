const AWS = require('aws-sdk');
const crypto = require('crypto');

const REGION = process.env.COGNITO_REGION;
const userPoolId = process.env.COGNITO_USER_POOL_ID;
const clientId = process.env.COGNITO_CLIENT_ID;
// const clientSecret = 'gkc8rm3s6agcdmb1f8rue8p2rlo4ol11qoq5ecgbgved1e4f3gl'; // フロントアプリケーション側でしか保持していないはず
// const clientSecret = 'test'; // フロントアプリケーション側でしか保持していないはず

const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({
    apiVersion: 'latest',
    region: REGION,
    // accessKeyId: accessKeyId,
    // secretAccessKey: secretAccessKey
});

async function main() {
    const params = {
        UserPoolId: userPoolId,
        ClientId: clientId
    };

    cognitoidentityserviceprovider.describeUserPoolClient(params, (err, data) => {
        console.log('describeUserPoolClient result:', err, data);
    });
}

main().then(() => {
    console.log('success!');
});
