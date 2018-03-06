/**
 * authorize
 */
import * as debug from 'debug';
import { Request, Response } from 'express';
import { errorProsess, getOptions } from '../base/base.controller';
const log = debug('SSKTS:authorize');

export async function getCredentials(req: Request, res: Response) {
    log('getCredentials');
    try {
        const options = getOptions(req);
        const accessToken = await options.auth.getAccessToken();
        const credentials = {
            accessToken: accessToken
        };
        res.json(credentials);
    } catch (err) {
        errorProsess(res, err);
    }
}
