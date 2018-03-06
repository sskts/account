/**
 * 多言語
 */

import { NextFunction, Request, Response } from 'express';
import * as i18n from 'i18n';

const directory = `${__dirname}/../../locales`;
i18n.configure({
    locales: ['ja'],
    defaultLocale: 'ja',
    directory: directory, // 辞書ファイルのありかを指定
    objectNotation: true, // オブジェクトを利用したい場合はtrue
    updateFiles: false // ページのビューで自動的に言語ファイルを更新しない
});

/**
 * 言語セット
 * @function setLocale
 * @param {Request} req
 * @param {res} res
 * @param {NextFunction} next
 */
export function setLocale(req: Request, res: Response, next: NextFunction) {
    i18n.init(req, res, next);
    if (req.session !== undefined && req.session.locale !== undefined) {
        i18n.setLocale(req, req.session.locale);
    } else {
        i18n.setLocale(req, 'ja');
    }
}
