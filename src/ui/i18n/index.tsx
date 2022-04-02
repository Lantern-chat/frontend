import { navigatorDetector, queryStringDetector } from "typesafe-i18n/detectors";

export const DETECTORS = [
    navigatorDetector,
];

if(__DEV__) {
    DETECTORS.unshift(queryStringDetector);
}

import type { Locales } from "./i18n-types";

export type ILanguages = {
    [K in Locales]: {
        n: string,
        e: string,
    }
};

// @stringify
export const LANGUAGES: ILanguages = {
    en: { n: "English", e: "🇺🇸" },
    es: { n: "Español", e: "🇪🇸" },
};