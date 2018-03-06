/**
 * セッション
 */

import * as connectRedis from 'connect-redis';
import * as session from 'express-session';
import * as redis from 'redis';

const redisClient = redis.createClient(
    Number(process.env.REDIS_PORT),
    process.env.REDIS_HOST,
    {
        password: process.env.REDIS_KEY,
        tls: {
            servername: process.env.REDIS_HOST
        },
        return_buffers: true
    }
);

const sessionStore = new (connectRedis(session))({ client: redisClient });

export default session({
    secret: 'FrontendSecret',
    resave: false,
    rolling: true,
    proxy: true,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        secure: true,
        httpOnly: true,
        maxAge: 1800000 // 30 * 60 * 1000
    }
});
