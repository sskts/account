"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Redis Cacheクライアント
 */
const redis = require("redis");
exports.default = redis.createClient({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    password: process.env.REDIS_KEY,
    tls: { servername: process.env.REDIS_HOST }
});
