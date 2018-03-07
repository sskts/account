/**
 * 共通
 * @namespace services.util
 */
import * as moment from 'moment';

/**
 * @memberof services.util
 * @enum DIGITS
 * @type number
 */
export enum DIGITS {
    '02' = -2,
    '03' = -3,
    '08' = -8
}

/**
 * 環境
 * @memberof services.util
 * @enum ENV
 * @type string
 */
export enum ENV {
    /**
     * 開発
     */
    Development = 'development',
    /**
     * テスト
     */
    Test = 'test',
    /**
     * 本番
     */
    Production = 'production'
}

/**
 * 時間フォーマット
 * @memberof services.util
 * @function timeFormat
 * @param {string} referenceDate 基準日
 * @param {Date} screeningTime 時間
 * @returns {string}
 */
export function timeFormat(screeningTime: Date, referenceDate: string) {
    const HOUR = 60;
    const diff = moment(screeningTime).diff(moment(referenceDate), 'minutes');
    const hour = (`00${Math.floor(diff / HOUR)}`).slice(DIGITS['02']);
    const minutes = moment(screeningTime).format('mm');

    return `${hour}:${minutes}`;
}

/**
 * HTMLエスケープ
 * @memberof services.util
 * @function escapeHtml
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str: string): string {
    const change = (match: string): string => {
        const changeList: any = {
            '&': '&amp;',
            '\'': '&#x27;',
            '`': '&#x60;',
            '"': '&quot;',
            '<': '&lt;',
            '>': '&gt;'
        };

        return changeList[match];
    };

    return str.replace(/[&'`"<>]/g, change);
}

/**
 * カンマ区切りへ変換
 * @memberof services.util
 * @function formatPrice
 * @param {number} price
 * @returns {string}
 */
export function formatPrice(price: number): string {
    return String(price).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
}

/**
 * ベース64エンコード
 * @memberof services.util
 * @function bace64Encode
 * @param {string} str
 * @returns {string}
 */
export function bace64Encode(str: string): string {
    return new Buffer(str).toString('base64');
}

/**
 * ベース64デコード
 * @memberof services.util
 * @function base64Decode
 * @param {string} str
 * @returns {string}
 */
export function base64Decode(str: string): string {
    return new Buffer(str, 'base64').toString();
}
