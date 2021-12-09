"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisRepository = void 0;
const REDIS_KEY_PREFIX = 'sskts-account.authorizationCode.';
const AUTHORIZATION_CODE_EXPIRES_IN_SECONDS = 600;
/**
 * 認可コードリポジトリー
 */
class RedisRepository {
    constructor(redisClient) {
        this.redisClient = redisClient;
    }
    findOne(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `${REDIS_KEY_PREFIX}${code}`;
            return new Promise((resolve, reject) => {
                this.redisClient.get(key, (err, value) => {
                    if (err instanceof Error) {
                        reject();
                        return;
                    }
                    resolve((value === null) ? undefined : JSON.parse(value));
                });
            });
        });
    }
    save(code, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `${REDIS_KEY_PREFIX}${code}`;
            yield new Promise((resolve, reject) => {
                this.redisClient.multi()
                    .set(key, JSON.stringify(data))
                    .expire(key, AUTHORIZATION_CODE_EXPIRES_IN_SECONDS)
                    .exec((err) => {
                    if (err instanceof Error) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
        });
    }
    remove(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = `${REDIS_KEY_PREFIX}${code}`;
            yield new Promise((resolve) => {
                this.redisClient.del(key, () => {
                    resolve();
                });
            });
        });
    }
}
exports.RedisRepository = RedisRepository;
