/**
 * セッションミドルウェア
 */

import * as connectRedis from 'connect-redis';
import * as session from 'express-session';

import redisClient from '../redisClient';

const store = new (connectRedis(session))({
    client: redisClient
});

export default session({
    secret: 'sskts-account-session-secret',
    resave: false,
    rolling: true,
    saveUninitialized: false,
    store: store,
    cookie: {
        secure: true,
        httpOnly: true,
        maxAge: 3600000
    }
});
