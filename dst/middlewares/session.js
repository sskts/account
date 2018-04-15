"use strict";
/**
 * セッションミドルウェア
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const connectRedis = require("connect-redis");
const session = require("express-session");
exports.default = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
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
});
