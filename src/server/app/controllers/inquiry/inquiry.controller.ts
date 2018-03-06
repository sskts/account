/**
 * 照会
 */
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as debug from 'debug';
import { Request, Response } from 'express';
import { NOT_FOUND } from 'http-status';
import * as moment from 'moment';
import { InquiryModel } from '../../models/inquiry/inquiry.model';
import { getOptions } from '../base/base.controller';
const log = debug('SSKTS:inquiry');

/**
 * 照会表示
 * @function render
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function login(req: Request, res: Response): Promise<void> {
    log('render');
    try {
        const inquiryModel = new InquiryModel((<Express.Session>req.session).inquiry);
        const options = getOptions(req);
        const args = { branchCode: req.query.theater };
        log('findMovieTheaterByBranchCode', args);
        inquiryModel.movieTheaterOrganization = await new sasaki.service.Organization(options).findMovieTheaterByBranchCode(args);
        inquiryModel.input.reserveNum = (req.query.reserve !== undefined) ? req.query.reserve : '';
        inquiryModel.save(req.session);
        res.locals.inquiryModel = inquiryModel;
        res.locals.error = null;
        res.render('inquiry/login');
        log('inquiryModel', inquiryModel);
    } catch (err) {
        log(err);
        res.locals.error = err;
        res.render('error/index');
    }
}

/**
 * 照会
 * @function auth
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function auth(req: Request, res: Response): Promise<void> {
    log('auth');
    const options = getOptions(req);
    const inquiryModel = new InquiryModel((<Express.Session>req.session).inquiry);
    try {
        loginForm(req);
        if (inquiryModel.movieTheaterOrganization === undefined) {
            throw new Error('movieTheaterOrganization is undefined');
        }
        const validationResult = await req.getValidationResult();
        inquiryModel.input = {
            reserveNum: req.body.reserveNum,
            telephone: req.body.telephone
        };
        inquiryModel.save(req.session);
        if (validationResult.isEmpty()) {
            const theaterCode = inquiryModel.movieTheaterOrganization.location.branchCode;
            const args = {
                telephone: inquiryModel.input.telephone,
                confirmationNumber: Number(inquiryModel.input.reserveNum),
                theaterCode: inquiryModel.movieTheaterOrganization.location.branchCode
            };
            log('findByOrderInquiryKey', args);
            inquiryModel.order = await new sasaki.service.Order(options).findByOrderInquiryKey(args);
            log('findByOrderInquiryKey', inquiryModel.order);
            if (inquiryModel.order === undefined) {
                log('NOT FOUND');
                const error = {
                    code: 404,
                    errors: [{
                        name: 'SSKTSError',
                        reason: 'NotFound',
                        entityName: 'order',
                        message: 'Not Found: order.'
                    }]
                };
                throw error;
            }
            inquiryModel.save(req.session);
            const orderNumber = inquiryModel.order.orderNumber;
            return res.redirect(`/inquiry/confirm/${orderNumber}/?theater=${theaterCode}`);
        } else {
            res.locals.inquiryModel = inquiryModel;
            res.locals.error = validationResult.mapped();
            res.render('inquiry/login');

            return;
        }
    } catch (err) {
        log(err);
        if (err.code !== undefined && err.code === NOT_FOUND) {
            res.locals.inquiryModel = inquiryModel;
            res.locals.error = getInquiryError(req);
            return res.render('inquiry/login');
        }
        res.locals.error = err;
        res.render('error/index');
    }
}

/**
 * 照会確認表示
 * @function confirm
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function confirm(req: Request, res: Response): Promise<void> {
    log('confirm');
    if (req.session === undefined || req.session.inquiry === undefined) {
        const orderNumber = req.params.orderNumber;
        const theaterCode = req.query.theater;
        return res.redirect(`/inquiry/login?orderNumber=${orderNumber}&theater=${theaterCode}`);
    }
    const inquiryModel = new InquiryModel(req.session.inquiry);
    res.locals.inquiryModel = inquiryModel;
    res.locals.moment = moment;
    res.locals.timeFormat = timeFormat;
    delete req.session.inquiry;
    res.render('inquiry/confirm');
}

/**
 * 購入者情報入力フォーム
 */
function loginForm(req: Request): void {
    const minLength = 9;
    req.checkBody('reserveNum', `${req.__('common.purchaseNumber')}${req.__('common.validation.required')}`).notEmpty();
    req.checkBody('reserveNum', `${req.__('common.purchaseNumber')}${req.__('common.validation.isNumber')}`).matches(/^[0-9]+$/);
    req.checkBody('telephone', `${req.__('common.telNum')}${req.__('common.validation.required')}`).notEmpty();
    req.checkBody('telephone', `${req.__('common.telNum')}${req.__('common.validation.isNumber')}`).matches(/^[0-9]+$/);
    req.checkBody(
        'telephone',
        `${req.__('common.telNum')}${req.__('common.validation.minlength %s', String(minLength))}`
    ).isLength({
        min: minLength
    });
}

/**
 * 照会エラー取得
 * @function getInquiryError
 * @param {Request} req
 * @returns {any}
 */
function getInquiryError(req: Request) {
    return {
        reserveNum: {
            parm: 'reserveNum',
            msg: `${req.__('common.purchaseNumber')}${req.__('common.validation.inquiry')}`,
            value: ''
        },
        telephone: {
            parm: 'telephone',
            msg: `${req.__('common.telNum')}${req.__('common.validation.inquiry')}`,
            value: ''
        }
    };
}

/**
 * 時間フォーマット
 * @function timeFormat
 * @param {string} referenceDate 基準日
 * @param {Date} screeningTime 時間
 * @returns {string}
 */
function timeFormat(screeningTime: Date, referenceDate: string) {
    const DIGITS = -2;
    const HOUR = 60;
    const diff = moment(screeningTime).diff(moment(referenceDate), 'minutes');
    const hour = (`00${Math.floor(diff / HOUR)}`).slice(DIGITS);
    const minutes = moment(screeningTime).format('mm');

    return `${hour}:${minutes}`;
}
