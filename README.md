<img src="https://motionpicture.jp/images/common/logo_01.svg" alt="motionpicture" title="motionpicture" align="right" height="56" width="98"/>

# SSKTS Account Web Application

## Table of contents

* [Usage](#usage)
* [Jsdoc](#jsdoc)
* [License](#license)

## Usage

### Environment variables

| Name                                | Required | Value           | Purpose                         |
|-------------------------------------|----------|-----------------|---------------------------------|
| `DEBUG`                             | false    | sskts-account:* | Debug                           |
| `COGNITO_AUTHORIZE_SERVER_ENDPOINT` | true     |                 | 本来のCognitoサービスの認可サーバードメイン       |
| `COGNITO_USER_POOL_ID`              | true     |                 | CognitoユーザープールID                |
| `COGNITO_CLIENT_ID`                 | true     |                 | 本アプリのCognitoクライアントID            |
| `COGNITO_REGION`                    | true     |                 | Cognitoリージョン                    |
| `REDIS_HOST`                        | true     |                 | セッションと一時データ保管に使用するRedis Cache   |
| `REDIS_PORT`                        | true     |                 | セッションと一時データ保管に使用するRedis Cache   |
| `REDIS_KEY`                         | true     |                 | セッションと一時データ保管に使用するRedis Cache   |
| `AWS_ACCESS_KEY_ID`                 | true     |                 | aws-sdk使用に十分な権限を持ったアクセスキー       |
| `AWS_SECRET_ACCESS_KEY`             | true     |                 | aws-sdk使用に十分な権限を持ったシークレットアクセスキー |

## Jsdoc

`npm run doc` outputs docs to ./docs.

## License

UNLICENSED
