/**
 * セッションミドルウェア
 */

import * as connectRedis from 'connect-redis';
import { NextFunction, Request, Response } from 'express';
import * as session from 'express-session';

export default async (req: Request, res: Response, next: NextFunction) => {
    session({
        secret: 'sskts-account-session-secret',
        resave: false,
        rolling: true,
        saveUninitialized: false,
        store: new (connectRedis(session))({
            client: req.redisClient
        }),
        cookie: {
            secure: true,
            httpOnly: true,
            maxAge: 3600000
        }
    })(req, res, next);
};
