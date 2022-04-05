import { Accessor, createMemo } from "solid-js";
import dayjs from "lib/time";
import { useI18nContext } from "ui/i18n/i18n-solid";

// TODO: Setup ticker to update timestamps

export function createTimestamp(ts: Accessor<NonNullable<dayjs.ConfigType> | null | undefined>, format?: string | Accessor<string | undefined>): Accessor<string> {
    const { locale, LL } = useI18nContext();

    // track locale
    return createMemo(() => (locale(),
        dayjs(ts()).format((typeof format === 'function' ? format() : format) || LL().DEFAULT_TS_FORMAT())));
}

export function createCalendar(ts: Accessor<NonNullable<dayjs.ConfigType> | null | undefined>): Accessor<string> {
    const { locale } = useI18nContext();

    // track locale
    return createMemo(() => (locale(), dayjs(ts()).calendar()));
}