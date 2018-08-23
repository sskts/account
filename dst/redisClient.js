"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Redis Cacheクライアント
 */
const redis = require("redis");
exports.default = redis.createClient({
    host: process.env.REDIS_HOST,
    // tslint:disable-next-line:no-magic-numbers
    port: parseInt(process.env.REDIS_PORT, 10),
    password: process.env.REDIS_KEY,
    tls: { servername: process.env.REDIS_HOST }
});
