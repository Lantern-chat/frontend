import { Accessor, createContext, createMemo, JSX, createComponent, onCleanup, useContext, createEffect } from "solid-js";
import { createStore } from "solid-js/store";

import { useI18nContext } from "ui/i18n/i18n-solid";
import { usePageVisible } from "ui/hooks/usePageVisible";
import { DateParams } from "lib/time";
import { formatters } from "ui/i18n";

export interface TimeStore {
    s: number,
    m: number,
    h: number,
    d: number,
}

const DEFAULT_TIME: TimeStore = { s: 0, m: 0, h: 0, d: 0 };

var now = new Date();
var today = new Date(now).setHours(0, 0, 0, 0);

export const TimeContext = /*#__PURE__*/createContext<TimeStore>(DEFAULT_TIME);

export function createCalendar(ts: Accessor<DateParams>, l?: ReturnType<typeof useI18nContext>): Accessor<string> {
    const { locale } = l || useI18nContext(), time = useContext(TimeContext);

    // track locale and current day, reusing `now` to avoid recomputing it
    return () => (time.d, formatters[locale()].calendar(ts(), today));
}

// passthrough function that would subscribe to the relevant time component
function subscribe(time: TimeStore, t: Date): Date {
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

export function TimeProvider(props: { children: JSX.Element }) {
    let [time, setTime] = createStore(DEFAULT_TIME);

    let update = () => {
        today = new Date(now = new Date()).setHours(0, 0, 0, 0);

        setTime({
            s: now.getSeconds(),
            m: now.getMinutes(),
            h: now.getHours(),
            d: now.getDate(),
        });
    };

    update();

    let visible = usePageVisible(), timer: ReturnType<typeof setInterval>;

    createEffect(() => {
        if(visible()) {
            __DEV__ && console.log("Starting timer");

            update();
            timer = setInterval(update, 1000);
            onCleanup(() => {
                __DEV__ && console.log("Stopping timer");

                clearInterval(timer);
            });
        }
    });

    return createComponent(TimeContext.Provider, {
        value: time,
        get children() {
            return props.children;
        }
    });
}