"use strict";
/**
 * セッションミドルウェア
 */
Object.defineProperty(exports, "__esModule", { value: true });
const connectRedis = require("connect-redis");
const session = require("express-session");
const redisClient_1 = require("../redisClient");
exports.default = session({
    secret: 'sskts-account-session-secret',
    resave: false,
    rolling: true,
    saveUninitialized: false,
    store: new (connectRedis(session))({
        client: redisClient_1.default
    }),
    cookie: {
        secure: true,
        httpOnly: true,
        maxAge: 3600000
    }
});
