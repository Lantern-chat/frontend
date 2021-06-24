import React from "react";

import { Translation } from "./translation";

export interface LangItemProps {
    /** Phrase being translated */
    t: Translation,

    /** Number of things */
    count?: number,

    render?: (text: string) => React.ReactNode,
}

/** Type given to the translation JSON files */
export type TranslationTable = { [P in keyof typeof Translation]: string };

/** Creates a simple anonymous React.Component that looks up the given item in the translation table */
export function createTranslation(table: TranslationTable): React.FunctionComponent<LangItemProps> {
    // return as a fragment that doesn't generate any additional DOM nodes
    let renderer: React.FunctionComponent<LangItemProps> = (props: LangItemProps) => {
        let text = table[Translation[props.t]];
        if(props.render !== undefined) {
            return <>{props.render(text)}</>;
        }
        return (<>{text}</>)
    };
    if(__DEV__) {
        renderer.displayName = "i18n_Inner";
    }
    return renderer;
}

