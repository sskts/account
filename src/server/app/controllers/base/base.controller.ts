/**
 * base
 */

import * as debug from 'debug';
import { Request, Response } from 'express';
import * as httpStatus from 'http-status';
import { AuthModel } from '../../models/auth/auth.model';

const log = debug('SSKTS:base');

/**
 * オプション取得
 * @function getOptions
 * @param {Request} req
 */
export function getOptions(req: Request) {
    const authModel = new AuthModel((<Express.Session>req.session).auth);
    const options = {
        endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
        auth: authModel.create()
    };
    authModel.save(req.session);

    return options;
}

/**
 * エラー
 * @function error
 * @param {Response} res
 * @param {any} err
 */
export function errorProsess(res: Response, err: any) {
    log('errorProsess', err);
    if (err.code !== undefined) {
        res.status(err.code);
    } else {
        res.status(httpStatus.BAD_REQUEST);
    }
    res.json(err);
}
