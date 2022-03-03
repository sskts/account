import { RedisClient } from 'redis';

const REDIS_KEY_PREFIX = 'sskts-account.authorizationCode.';
const AUTHORIZATION_CODE_EXPIRES_IN_SECONDS = 600;

export interface IData {
    username: string;
    clientId: string;
    redirectUri: string;
}

/**
 * 認可コードリポジトリー
 */
export class RedisRepository {
    public readonly redisClient: RedisClient;

    constructor(redisClient: RedisClient) {
        this.redisClient = redisClient;
    }

    public async findOne(code: string): Promise<IData | undefined> {
        const key = `${REDIS_KEY_PREFIX}${code}`;

        return new Promise<any>((resolve, reject) => {
            this.redisClient.get(key, (err, value) => {
                if (err instanceof Error) {
                    reject();

                    return;
                }

                resolve((value === null) ? undefined : JSON.parse(value));
            });
        });
    }

    public async save(code: string, data: IData): Promise<void> {
        const key = `${REDIS_KEY_PREFIX}${code}`;
        await new Promise<void>((resolve, reject) => {
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
    }

    public async remove(code: string): Promise<void> {
        const key = `${REDIS_KEY_PREFIX}${code}`;
        await new Promise<void>((resolve) => {
            this.redisClient.del(key, () => {
                resolve();
            });
        });
    }
}
