import React from "react";
import { TransLangProps } from "./i18n/_base";
export { Translation } from "./i18n/_base";

type Loader = () => Promise<{default: React.ExoticComponent<TransLangProps>}>;

// TODO: More translations...
export type Language = "en";
const LANG_INIT: Record<Language, Loader> = {
    "en": () => import("./i18n/en"),
};

export function preload(lang: Language) {
    let promise = LANG_INIT[lang]();
    LANG_INIT[lang] = () => promise;
}

export interface TranslationProps extends TransLangProps {
    lang: Language,
}

export class I18N extends React.PureComponent<TranslationProps> {
    lang: React.ExoticComponent<TransLangProps>;

    constructor(props: TranslationProps) {
        super(props);
        this.lang = React.lazy(LANG_INIT[props.lang]);
    }

    render() { return React.createElement(this.lang, this.props); }
}