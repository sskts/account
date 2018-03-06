import * as sasaki from '@motionpicture/sskts-api-nodejs-client';

/**
 * 照会セッション
 * @interface IInquiryModel
 */
export interface IInquiryModel {
    order?: sasaki.factory.order.IOrder;
    input?: IInput;
    movieTheaterOrganization?: sasaki.factory.organization.movieTheater.IPublicFields;
}

interface IInput {
    reserveNum: string;
    telephone: string;
}

/**
 * 照会モデル
 * @class InquiryModel
 */
export class InquiryModel {
    /**
     * オーダー
     */
    public order?: sasaki.factory.order.IOrder;
    /**
     * 入力
     */
    public input: IInput;
    /**
     * 劇場
     */
    public movieTheaterOrganization?: sasaki.factory.organization.movieTheater.IPublicFields;

    /**
     * @constructor
     * @param {any} session
     */
    constructor(session?: any) {
        if (session === undefined) {
            session = {};
        }
        this.order = session.order;
        this.input = (session.input !== undefined)
            ? session.input
            : {
                reserveNum: '',
                telephone: ''
            };
        this.movieTheaterOrganization = session.movieTheaterOrganization;
    }


    /**
     * セッションへ保存
     * @memberof InquiryModel
     * @method save
     * @returns {Object}
     */
    public save(session: any): void {
        const inquirySession: IInquiryModel = {
            order: this.order,
            input: this.input,
            movieTheaterOrganization: this.movieTheaterOrganization
        };
        session.inquiry = inquirySession;
    }
}

