import React from "react";
import { LangItemProps } from "./createTranslation";
export { Translation } from "./createTranslation";

export const LocaleContext: React.Context<Language> = React.createContext('en');

type Loader = () => Promise<{ default: React.FunctionComponent<LangItemProps> }>;
type Lazy = React.LazyExoticComponent<React.FunctionComponent<LangItemProps>>;

type LazyLoader = Loader | Lazy;

// TODO: More translations...
export type Language = "en";
const LANG_INIT: Record<Language, LazyLoader> = {
    "en": () => import(/* webpackChunkName: 'i18n.en' */ "./lang/en"),
};

export function preload(lang: Language): Lazy {
    let loader = LANG_INIT[lang];

    if(loader instanceof Function) {
        let promise = loader(); // start loading now, as the language pack is needed ASAP
        loader = LANG_INIT[lang] = React.lazy(() => promise);
    }

    return loader as Lazy;
}

/**
 * Memoized component that uses the LocaleContext to select a language,
 * and the props to select which translation string to render.
 * */
export const I18N = function(props: LangItemProps) {
    let lang = React.useContext(LocaleContext);
    return React.useMemo(() => React.createElement(preload(lang), props), [lang, props]);
};