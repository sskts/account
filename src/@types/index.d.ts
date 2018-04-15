/**
 * アプリケーション固有の型を定義
 * @ignore
 */
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import * as express from 'express';
import { RedisClient } from 'redis';

declare global {
    namespace Express {
        export interface ICredentials {
            access_token: string;
            refresh_token: string;
            id_token: string;
            token_type: string;
            expires_in: number;
        }

        export interface IUser {
            username: string;
        }

        // tslint:disable-next-line:interface-name
        export interface Request {
            /**
             * Redis Cacheクライアント
             */
            redisClient: RedisClient;
            /**
             * Cognitoサービスプロバイダー
             */
            cognitoidentityserviceprovider: CognitoIdentityServiceProvider;
        }

        // tslint:disable-next-line:interface-name
        export interface Session {
            /**
             * ログインユーザー
             * 非ログインであればundefined
             */
            user?: IUser;
        }
    }
}
