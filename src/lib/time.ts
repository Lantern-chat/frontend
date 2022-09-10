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

const FORMAT = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|LTS?|L{1,4}|SSS/g;

// global cache of per-locale formatters
var CACHE: Record<string, { [key: string]: Intl.DateTimeFormat }> = {};

const D = Intl.DateTimeFormat;
function component(l: string, c: string): Intl.DateTimeFormat {
    switch(c) {
        case 'MM': return new D(l, { month: 'numeric' });
        case 'MM': return new D(l, { month: '2-digit' });
        case 'MMM': return new D(l, { month: 'short' });
        case 'MMMM': return new D(l, { month: 'long' });
        case 'dd': // weekday: "narrow" is just one letter, so fallback to short format
        case 'ddd': return new D(l, { weekday: "short" });
        case 'dddd': return new D(l, { weekday: "long" });
        case 'LT': return new D(l, { minute: '2-digit', hour: 'numeric' });
        case 'LTS': return new D(l, { minute: '2-digit', hour: 'numeric', second: '2-digit' });
        case 'L': return new D(l, { month: '2-digit', day: '2-digit', year: 'numeric' });
        case 'LL': return new D(l, { month: 'long', day: '2-digit', year: 'numeric' });
        case 'LLL': return new D(l, { month: 'long', day: '2-digit', year: 'numeric', minute: '2-digit', hour: 'numeric' });
        case 'LLLL': return new D(l, { month: 'long', day: '2-digit', year: 'numeric', minute: '2-digit', hour: 'numeric', weekday: 'long' })
        default: return { format() { } } as any;
    }
}

export type DateParams = Date | number | string | null | undefined;

export function format(locale: string, s: string, t: DateParams): string {
    let cache = CACHE[locale] || (CACHE[locale] = {});
    t = new Date(t!);
    return s.replace(FORMAT, (m, $1) => $1 || (cache[m] || (cache[m] = component(locale, m))).format(t as Date) || '');
}

const SECONDS_A_MINUTE = 60;
const SECONDS_A_HOUR = SECONDS_A_MINUTE * 60;
const SECONDS_A_DAY = SECONDS_A_HOUR * 24;
const SECONDS_A_WEEK = SECONDS_A_DAY * 7;

const MILLISECONDS_A_SECOND = 1e3;
const MILLISECONDS_A_MINUTE = SECONDS_A_MINUTE * MILLISECONDS_A_SECOND;
const MILLISECONDS_A_HOUR = SECONDS_A_HOUR * MILLISECONDS_A_SECOND;
const MILLISECONDS_A_DAY = SECONDS_A_DAY * MILLISECONDS_A_SECOND;
const MILLISECONDS_A_WEEK = SECONDS_A_WEEK * MILLISECONDS_A_SECOND;

export interface ICalendarTable {
    lastDay: string,
    sameDay: string,
    nextDay: string,
    nextWeek: string,
    lastWeek: string,
    sameElse: string,
}

const DEFAULT_CALENDAR_FORMAT: ICalendarTable = {
    lastDay: '[Yesterday at] LT',
    sameDay: '[Today at] LT',
    nextDay: '[Tomorrow at] LT',
    nextWeek: 'dddd [at] LT',
    lastWeek: '[Last] dddd [at] LT',
    sameElse: 'L',
};

export function calendar(
    locale: string,
    t: DateParams,
    table: ICalendarTable = DEFAULT_CALENDAR_FORMAT,
    ref: Date | number = new Date().setHours(0, 0, 0, 0), // default to start of today
): string {
    let then = new Date(t!).setHours(0, 0, 0, 0);
    let diff = (then - +ref) / MILLISECONDS_A_DAY;

    let which: keyof ICalendarTable = diff < -6 ? 'sameElse' :
        diff < -1 ? 'lastWeek' :
            diff < 0 ? 'lastDay' :
                diff < 1 ? 'sameDay' :
                    diff < 2 ? 'nextDay' :
                        diff < 7 ? 'nextWeek' : 'sameElse';

    return format(locale, table[which], t);
}

export function months(locale: string): string[] {
    // arbitrary date to avoid odd month aliasing issue
    let d = new Date(1550124000000), months = [], c = component(locale, 'MMMM');

    for(let m = 0; m < 12; m++) {
        d.setMonth(m, 1);
        months.push(c.format(d));
    }
    return months;
}