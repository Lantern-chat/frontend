import dayjs from "dayjs";
export { Dayjs } from "dayjs";

import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

import advancedFormat from "dayjs/plugin/advancedFormat";
dayjs.extend(advancedFormat);

import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import localeData from 'dayjs/plugin/localeData';
dayjs.extend(localeData);

import updateLocale from 'dayjs/plugin/updateLocale';
dayjs.extend(updateLocale);

import calendar from 'dayjs/plugin/calendar';
dayjs.extend(calendar);

//import customParseFormat from 'dayjs/plugin/customParseFormat';
//dayjs.extend(customParseFormat);

export default dayjs;

//export function parse_shorthand(s: dayjs.ConfigType): dayjs.Dayjs {
//    // ISO 8061 without punctuation like [-:.]
//    let res = dayjs(s, 'YYYYMMDDTHHmmss.SSSZ');
//    // try shorthand first, and if that doesn't work just try regular.
//    return res.isValid() ? res : dayjs(s);
//}

const MAX_DURATION: number = 0x7FFFFFFF;

export interface LongTimeout {
    t: number,
}

export function setLongTimeout(cb: () => void, delay: number, existing?: LongTimeout): LongTimeout {
    let timeout = { t: 0 };
    if(delay <= MAX_DURATION) {
        timeout = { t: setTimeout(cb, delay) as any };
    } else {
        let start = Date.now();

        timeout.t = setTimeout(() => {
            let elapsed = Date.now() - start;
            setLongTimeout(cb, Math.max(0, delay - elapsed), timeout);
        }, MAX_DURATION) as any;
    }

    if(existing) {
        existing.t = timeout.t;
    }

    return timeout;
}

interface CancellablePromise<T> extends Promise<T> {
    cancel(): void;
}

export function delay(ms: number): CancellablePromise<void> {
    var tmp: { onCancel?: () => void } = {};
    let promise = <CancellablePromise<void>>new Promise((resolve, reject) => {
        let timeout = window.setTimeout(() => resolve(), ms);
        tmp.onCancel = () => { window.clearTimeout(timeout); reject(); };
    });

    promise.cancel = () => tmp.onCancel!();

    return promise;
}

export function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
        let completed = false;

        promise.then((value) => {
            if(!completed) {
                completed = true;
                resolve(value);
            }
        });

        setTimeout(() => {
            if(!completed) {
                completed = true;
                reject();
            }
        }, ms);
    })
}

//export class DurationCalculator {
//    now: number = performance.now();
//
//    update(now?: number) {
//      // TODO: Port over exponential moving average timing calculation from infinite scroll
//    }
//}