import { Component, JSX } from "solid-js";

import { Translation } from "./translation";

export interface LangItemProps {
    /** Phrase being translated */
    t: Translation,

    /** Number of things */
    count?: number,

    render?: (text: string) => JSX.Element,
}

/** Type given to the translation JSON files */
export type TranslationTable = { [P in keyof typeof Translation]: string };

/** Creates a simple anonymous React.Component that looks up the given item in the translation table */
export function createTranslation(table: TranslationTable): Component<LangItemProps> {
    // return as a fragment that doesn't generate any additional DOM nodes
    return (props: LangItemProps) => {
        let text = table[Translation[props.t]];
        if(props.render !== undefined) {
            return props.render(text);
        }
        return text;
    };
}

