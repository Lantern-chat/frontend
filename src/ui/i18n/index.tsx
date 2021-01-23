import Preact from "preact/compat";

import { LangItemProps, Translation } from "./createTranslation";
export { Translation } from "./createTranslation";

/** Context for subtree translations and locales */
export const LocaleContext = Preact.createContext<Language>('en');
LocaleContext.displayName = "LocaleContext";

type Loader = { loader: () => Promise<{ default: Preact.FunctionComponent<LangItemProps> }> };
type Lazy = Preact.FunctionComponent<LangItemProps>;
type LazyLoader = Loader | Lazy;

/** Composite type of all possible languages */
export type Language = "en"; // "en" | "es" | "de" | etc.
export const LANGS: Language[] = ["en"];

const LANG_INIT: Record<Language, LazyLoader> = {
    "en": { loader: () => import(/* webpackChunkName: 'i18n.en' */ "./lang/en") },
};


/** Initiates the loading of a language pack and returns a
 *  lazy Preact component for async rendering */
export function preload(lang: Language): Lazy {
    let loader = LANG_INIT[lang];

    if(typeof loader !== 'function') {
        let promise = loader.loader(); // start loading now, as the language pack is needed ASAP
        loader = LANG_INIT[lang] = Preact.lazy(() => promise);
    }

    return loader as Lazy;
}

/**
 * Construct an [[I18N]] element inline.
 *
 * ```jsx
 * import { Translation as T } from "./i18n";
 *
 * <span>
 *     {i18n(T.CHANNEL)}
 * </span>
 * ```
 * */
export function i18n(
    t: Translation,
    count?: number,
    render?: (text: string) => preact.ComponentChildren,
) {
    return <I18N t={t} count={count} render={render} />;
};

/**
 * Memoized component that uses the LocaleContext to select a language,
 * and the props to select which translation string to render.
 * */
export const I18N: preact.FunctionComponent<LangItemProps> = function(props: LangItemProps) {
    // https://github.com/facebook/react/issues/15156
    let lang = Preact.useContext(LocaleContext);
    return Preact.useMemo(() => {
        let Lang = preload(lang);
        return <Lang {...props} />
    }, [lang, props]);
};
