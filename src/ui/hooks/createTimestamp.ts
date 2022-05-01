import { Accessor, createContext, createMemo, JSX, createComponent, onCleanup, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import dayjs from "lib/time";

import { useI18nContext } from "ui/i18n/i18n-solid";

export interface TimeStore {
    s: number,
    m: number,
    h: number,
    d: number,
}

const DEFAULT_TIME: TimeStore = { s: 0, m: 0, h: 0, d: 0 };

export const TimeContext = /*#__PURE__*/createContext<TimeStore>(DEFAULT_TIME);

export function createTimestamp(ts: Accessor<NonNullable<dayjs.ConfigType> | null | undefined>, format?: string | Accessor<string | undefined>): Accessor<string> {
    const { locale, LL } = useI18nContext();

    // track locale
    return createMemo(() => (locale(),
        dayjs(ts()).format((typeof format === 'function' ? format() : format) || LL().DEFAULT_TS_FORMAT())));
}

export function createCalendar(ts: Accessor<NonNullable<dayjs.ConfigType> | null | undefined>): Accessor<string> {
    const { locale } = useI18nContext(), time = useContext(TimeContext);

    // track locale and current day
    return createMemo(() => (locale(), time.d, dayjs(ts()).calendar()));
}

// passthrough function that would subscribe to the relevant time component
function subscribe(time: TimeStore, t: dayjs.Dayjs): dayjs.Dayjs {
    let diffs = (+now - +t) / 1000;

    if(diffs < 60) {
        time.s;
    } else if(diffs < 60 * 60) {
        time.m;
    } else if(diffs < 60 * 60 * 24) {
        time.h;
    } else {
        time.d;
    }

    return t;
}

var now = new Date();

export function TimeProvider(props: { children: JSX.Element }) {
    let [time, setTime] = createStore(DEFAULT_TIME);

    let timer = setInterval(() => {
        now = new Date();

        setTime({
            s: now.getSeconds(),
            m: now.getMinutes(),
            h: now.getHours(),
            d: now.getDate(),
        });
    }, 1000);

    onCleanup(() => clearInterval(timer));

    return createComponent(TimeContext.Provider, {
        value: time,
        get children() {
            return props.children;
        }
    });
}