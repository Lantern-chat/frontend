import * as dayjs from "dayjs";

import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

import advancedFormat from "dayjs/plugin/advancedFormat";
dayjs.extend(advancedFormat);

import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import localeData from 'dayjs/plugin/localeData';
dayjs.extend(localeData);

export default dayjs;

const MAX_DURATION: number = 0x7FFFFFFF;

export function setLongTimeout(cb: () => void, delay: number, existing?: { t: number }): { t: number } {
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