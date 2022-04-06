import { compareString } from "lib/compare";
import { navigatorDetector, queryStringDetector } from "typesafe-i18n/detectors";

export const DETECTORS = [
    navigatorDetector,
];

if(__DEV__) {
    DETECTORS.unshift(queryStringDetector);
}

import type { Locales } from "./i18n-types";

// TODO: Figure out how to handle currencies.
export interface Currency extends Intl.NumberFormatOptions {
    compactDisplay?: "short" | "long",
    style: 'currency' | 'decimal' | 'percent' | 'unit',
    currency: string,
    currencyDisplay?: "symbol" | "narrowSymbol" | "code" | "name",
    currencySign?: "accounting" | "standard",
    notation?: "standard" | "scientific" | "engineering" | "compact",
    signDisplay?: "always" | "auto" | "exceptZero" | "negative" | "never",
    numberingSystem?: "arab" | "arabext" | "bali" | "beng" | "deva" | "fullwide" | "gujr" | "guru" | "hanidec" | "khmr" | "knda" | "laoo" | "latn" | "limb" | "mlym" | "mong" | "mymr" | "orya" | "tamldec" | "telu" | "thai" | "tibt"
}

export interface ILanguage {
    /// Name of language (in language)
    n: string,
    /// Emoji used to represent it (flag usually)
    e: string,
    rtl?: boolean,
    /// DayJS Locale override
    d?: string,

    /// Does NOT use SI Units (less common, so inverted logic)
    nsi?: boolean | 1,
}

export type ILanguages = {
    [K in Locales]: ILanguage
};

// @stringify
export const LANGUAGES: ILanguages = {
    'en-US': { n: "English (American)", e: "🇺🇸", d: 'en', nsi: 1 },
    'en-GB': { n: "English (Traditional)", e: "🇬🇧", d: 'en-gb' },
    es: { n: "Español", e: "🇪🇸" },
    owo: { n: "OwO (English)", e: "😺", d: 'en', nsi: 1 }
};

export const LANGUAGE_KEYS = Object.keys(LANGUAGES).sort(compareString) as Array<Locales>;

import dayjs from "lib/time";
import { useI18nContext } from "./i18n-solid";
import { loadedLocales } from "./i18n-util";
import { Accessor, createMemo } from "solid-js";

/// This should be prefered over useI18nContext when using `setLocale`
export function useLocale(): ReturnType<typeof useI18nContext> & { lang: Accessor<ILanguage> } {
    let { LL, locale, setLocale } = useI18nContext();

    return {
        LL, locale, setLocale: (locale: Locales) => {
            let lang = LANGUAGES[locale], l = lang.d || locale;
            dayjs.locale(l);
            dayjs.updateLocale(l, { calendar: loadedLocales[locale].CALENDAR_FORMAT });
            setLocale(locale);
        },
        lang: createMemo(() => LANGUAGES[locale()])
    };
}