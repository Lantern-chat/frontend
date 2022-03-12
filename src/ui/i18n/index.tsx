import { JSX, createContext, useContext, lazy, createMemo, Component } from "solid-js";
import { Dynamic } from "solid-js/web";

import { LangItemProps } from "./createTranslation";
import { Translation } from "./translation";
export { Translation } from "./translation";

type LangItem = Component<LangItemProps>;
type Loader = () => Promise<{ default: LangItem }>;
const __LAZY_TYPE = () => lazy<LangItem>(null as any);
type LazyLoader = ReturnType<typeof __LAZY_TYPE>;

/** Composite type of all possible languages */
export type Language = "en"; // "en" | "es" | "de" | etc.
export const LANGS: Language[] = ["en"];

export interface ILocaleContext {
    lang: Language,
    setLocale: (locale: Language) => void,
}

/** Context for subtree translations and locales */
export const LocaleContext = /*#__PURE__*/ createContext<ILocaleContext>({ lang: "en", setLocale: (locale: Language) => { } });

const LANG_LOADERS: Record<Language, LazyLoader> = {
    "en": /*#__PURE__*/ lazy(() => import(/* webpackChunkName: 'i18n.en' */ "./lang/en")),
};

/** Initiates the loading of a language pack and returns a
 *  lazy React component for async rendering */
export function preload(lang: Language): LazyLoader {
    let loader = LANG_LOADERS[lang];
    loader.preload();
    return loader;
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
    render?: (text: string) => JSX.Element,
) {
    return <I18N t={t} count={count} render={render} />;
};

/**
 * Memoized component that uses the LocaleContext to select a language,
 * and the props to select which translation string to render.
 * */
export function I18N(props: LangItemProps) {
    let Lang = createMemo(() => {
        let ctx = useContext(LocaleContext);
        return preload(ctx.lang) as LangItem;
    });

    return <Dynamic component={Lang()} {...props} />
}
