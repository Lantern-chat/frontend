import React from "react";

export interface LangItemProps {
    /** Phrase being translated */
    t: Translation,

    /** Number of things */
    count?: number,
}

/** Type given to the translation JSON files */
export type TranslationTable = { [P in keyof typeof Translation]: string };

/** Creates a simple anonymous React.Component that looks up the given item in the translation table */
export function createTranslation(table: TranslationTable): React.FunctionComponent<LangItemProps> {
    // return as a fragment that doesn't generate any additional DOM nodes
    return (props) => (<>{table[Translation[props.t]]}</>);
}

/** Enum of all possible translation phrase keys */
export enum Translation {
    CHANNEL,
    PARTY,
    DIRECT_MESSAGE,
    CREATE_DIRECT_MESSAGE,
};
