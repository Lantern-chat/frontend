import { Accessor, createMemo } from "solid-js";
import dayjs from "lib/time";
import { useI18nContext } from "ui/i18n/i18n-solid";

export const DEFAULT_FORMAT = "dddd, MMM Do YYYY, h:mm A";

// TODO: Setup ticker to update timestamps

export function createTimestamp(ts: Accessor<NonNullable<dayjs.ConfigType>>, format?: string | Accessor<string>): Accessor<string>;
export function createTimestamp(ts: Accessor<NonNullable<dayjs.ConfigType> | null | undefined>, format?: string | Accessor<string>): Accessor<string | undefined>;

export function createTimestamp(ts: Accessor<dayjs.ConfigType>, format: string | Accessor<string> = DEFAULT_FORMAT) {
    let { locale } = useI18nContext();

    return createMemo(() => {
        let time = ts();
        if(time) {
            return dayjs(time).locale(locale()).format(typeof format === 'function' ? format() : format);
        }
        return;
    });
}

export function createCalendar(ts: Accessor<NonNullable<dayjs.ConfigType>>): Accessor<string>;
export function createCalendar(ts: Accessor<NonNullable<dayjs.ConfigType> | null | undefined>): Accessor<string | undefined>;

export function createCalendar(ts: Accessor<dayjs.ConfigType>) {
    let { locale } = useI18nContext();

    return createMemo(() => {
        let time = ts();
        if(time) {
            return dayjs(time).locale(locale()).calendar();
        }
        return;
    });
}