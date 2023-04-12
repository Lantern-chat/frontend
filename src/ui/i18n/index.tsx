import { compareString } from "lib/compare";
import { navigatorDetector, queryStringDetector } from "typesafe-i18n/detectors";
import type { TranslateByString } from "typesafe-i18n";

export const DETECTORS = [
    navigatorDetector,
];

if(__DEV__) {
    DETECTORS.unshift(queryStringDetector);
}

import type { Formatters, Locales, TranslationFunctions } from "./i18n-types";

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
    "en-US": { n: "English (American)", e: "🇺🇸", d: "en", nsi: 1 },
    "en-GB": { n: "English (Traditional)", e: "🇬🇧", d: "en-gb" },
    es: { n: "Español", e: "🇪🇸" },
    id: { n: "Indonesia", e: "🇮🇩", d: "id" },
    owo: { n: "OwO (English)", e: "😺", d: "en", nsi: 1 }
};

export const LANGUAGE_KEYS = Object.keys(LANGUAGES).sort(compareString) as Array<Locales>;

import { useI18nContext } from "./i18n-solid";
import { loadedLocales, i18nString, loadedFormatters } from "./i18n-util";
import { Accessor, createMemo } from "solid-js";
import type { ExtendedFormatters } from "./formatters";

export const formatters = loadedFormatters as Record<Locales, ExtendedFormatters>;

/// This should be prefered over useI18nContext when using `setLocale`
export function useLocale(): ReturnType<typeof useI18nContext> & { lang: Accessor<ILanguage>, f: Accessor<ExtendedFormatters> } {
    const { LL, locale, setLocale } = useI18nContext();

    return {
        LL, locale, setLocale,
        lang: () => LANGUAGES[locale()],
        f: () => formatters[locale()],
    };
}

export function createLLL(): TranslateByString {
    let { locale } = useI18nContext();
    let LLL = createMemo(() => i18nString(locale()));
    return (...args) => LLL()(...args);
}
