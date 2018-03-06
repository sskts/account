/**
 * 購入
 */
import * as COA from '@motionpicture/coa-service';
import * as mvtkReserve from '@motionpicture/mvtk-reserve-service';
import * as sasaki from '@motionpicture/sskts-api-nodejs-client';
import * as debug from 'debug';
import { Request, Response } from 'express';
import * as moment from 'moment';
import { AuthModel } from '../../models/auth/auth.model';
import { errorProsess, getOptions } from '../base/base.controller';
const log = debug('SSKTS:purchase');

/**
 * 座席ステータス取得
 * @function getSeatState
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getSeatState(req: Request, res: Response): Promise<void> {
    log('getSeatState');
    try {
        const args = req.query;
        const result = await COA.services.reserve.stateReserveSeat(args);
        res.json(result);
    } catch (err) {
        errorProsess(res, err);
    }
}

/**
 * ムビチケチケットコード取得
 * @function mvtkTicketcode
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function mvtkTicketcode(req: Request, res: Response): Promise<void> {
    log('mvtkTicketcode');
    try {
        const args = req.body;
        const result = await COA.services.master.mvtkTicketcode(args);
        res.json(result);
    } catch (err) {
        errorProsess(res, err);
    }
}

/**
 * ムビチケ照会
 * @function mvtkPurchaseNumberAuth
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function mvtkPurchaseNumberAuth(req: Request, res: Response): Promise<void> {
    log('mvtkPurchaseNumberAuth');
    try {
        const args = req.body;
        const result = await mvtkReserve.services.auth.purchaseNumberAuth.purchaseNumberAuth(args);
        res.json(result);
    } catch (err) {
        errorProsess(res, err);
    }
}


/**
 * ムビチケ座席指定情報連携
 * @function mvtksSatInfoSync
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function mvtksSatInfoSync(req: Request, res: Response): Promise<void> {
    log('mvtksSatInfoSync');
    try {
        const args = req.body;
        const result = await mvtkReserve.services.seat.seatInfoSync.seatInfoSync(args);
        res.json(result);
    } catch (err) {
        errorProsess(res, err);
    }
}

/**
 * スケジュールリスト取得
 * @memberof Purchase.PerformancesModule
 * @function getSchedule
 * @param {Request} req
 * @param {Response} res
 * @returns {Promise<void>}
 */
export async function getSchedule(req: Request, res: Response): Promise<void> {
    try {
        const options = getOptions(req);
        const args = {
            startFrom: req.query.startFrom,
            startThrough: req.query.startThrough
        };
        const theaters = await new sasaki.service.Organization(options).searchMovieTheaters();
        const screeningEvents = await sasaki.service.event(options).searchIndividualScreeningEvent(args);
        const checkedScreeningEvents = await checkedSchedules({
            theaters: theaters,
            screeningEvents: screeningEvents
        });
        const result = {
            theaters: theaters,
            screeningEvents: checkedScreeningEvents
        };
        res.json({ result: result });
    } catch (err) {
        errorProsess(res, err);
    }
}

type IEventWithOffer = sasaki.factory.event.individualScreeningEvent.IEventWithOffer;

interface ICoaSchedule {
    theater: sasaki.factory.organization.movieTheater.IPublicFields;
    schedules: COA.services.master.IScheduleResult[];
}

let coaSchedules: ICoaSchedule[] = [];
coaSchedulesUpdate();

/**
 * COAスケジュール更新
 * @function coaSchedulesUpdate
 */
async function coaSchedulesUpdate(): Promise<void> {
    log('coaSchedulesUpdate start', coaSchedules.length);
    try {
        const result: ICoaSchedule[] = [];
        const authModel = new AuthModel();
        const options = {
            endpoint: (<string>process.env.SSKTS_API_ENDPOINT),
            auth: authModel.create()
        };
        const theaters = await sasaki.service.organization(options).searchMovieTheaters();
        const end = 5;
        for (const theater of theaters) {
            const scheduleArgs = {
                theaterCode: theater.location.branchCode,
                begin: moment().format('YYYYMMDD'),
                end: moment().add(end, 'week').format('YYYYMMDD')
            };
            const schedules = await COA.services.master.schedule(scheduleArgs);
            result.push({
                theater: theater,
                schedules: schedules
            });
        }
        coaSchedules = result;
        const upDateTime = 3600000; // 1000 * 60 * 60
        setTimeout(async () => { await coaSchedulesUpdate(); }, upDateTime);
    } catch (err) {
        log(err);
        await coaSchedulesUpdate();
    }
    log('coaSchedulesUpdate end', coaSchedules.length);
}

/**
 * COAスケジュール更新待ち
 * @function waitCoaSchedulesUpdate
 */
async function waitCoaSchedulesUpdate() {
    const timer = 1000;
    const limit = 10000;
    let count = 0;

    return new Promise<void>((resolve, reject) => {
        const check = setInterval(
            () => {
                if (count > limit) {
                    clearInterval(check);
                    reject();
                }
                if (coaSchedules.length > 0) {
                    clearInterval(check);
                    resolve();
                }
                count += 1;
            },
            timer
        );
    });
}

/**
 * スケジュール整合性確認
 * @function checkedSchedules
 */
async function checkedSchedules(args: {
    theaters: sasaki.factory.organization.movieTheater.IPublicFields[];
    screeningEvents: IEventWithOffer[];
}): Promise<IEventWithOffer[]> {
    if (coaSchedules.length === 0) {
        await waitCoaSchedulesUpdate();
    }
    const screeningEvents: IEventWithOffer[] = [];
    for (const coaSchedule of coaSchedules) {
        for (const schedule of coaSchedule.schedules) {
            const id = [
                coaSchedule.theater.location.branchCode,
                schedule.titleCode,
                schedule.titleBranchNum,
                schedule.dateJouei,
                schedule.screenCode,
                schedule.timeBegin
            ].join('');
            const screeningEvent = args.screeningEvents.find((event) => {
                return (event.identifier === id);
            });
            if (screeningEvent !== undefined) {
                screeningEvents.push(screeningEvent);
            }
        }
    }
    // const diffList = diffScreeningEvents(args.screeningEvents, screeningEvents);
    // for (const diff of diffList) {
    //     log('diff', diff.identifier);
    // }
    // log('all length', screeningEvents.length + diffList.length);
    // log('screeningEvents length', screeningEvents.length);
    // log('diffList length', diffList.length);

    return screeningEvents;
}

/**
 * 差分抽出
 * @function diffScreeningEvents
 * @param　{IEventWithOffer[]} array1
 * @param {IEventWithOffer[]} array2
 */
export function diffScreeningEvents(array1: IEventWithOffer[], array2: IEventWithOffer[]) {
    const diffArray: IEventWithOffer[] = [];

    for (const array of array1) {
        const target = array2.find((event) => {
            return (event.identifier === array.identifier);
        });
        if (target === undefined) {
            diffArray.push(array);
        }
    }

    return diffArray;
}
