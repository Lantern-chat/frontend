import React from "react";

export interface TransLangProps {
    t: Translation,
}

export type TranslationTable = { [P in keyof typeof Translation]: string };

export function createTranslation(table: TranslationTable): React.ExoticComponent<TransLangProps> {
    // return as a fragment that doesn't generate any additional DOM nodes
    return React.memo((props) => (<>{table[Translation[props.t]]}</>));
}

export enum Translation {
    Test_Avatar,
};
