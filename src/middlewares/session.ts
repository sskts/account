/**
 * セッションミドルウェア
 */

import * as connectRedis from 'connect-redis';
import * as session from 'express-session';

import redisClient from '../redisClient';

export default session({
    secret: 'sskts-account-session-secret',
    resave: false,
    rolling: true,
    saveUninitialized: false,
    store: new (connectRedis(session))({
        client: redisClient
    }),
    cookie: {
        secure: true,
        httpOnly: true,
        maxAge: 1296000000 // 15 * 24 * 60 * 60 * 1000
    }
});
