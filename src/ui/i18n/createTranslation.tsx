import React from "react";

export interface LangItemProps {
    t: Translation,
}

export type TranslationTable = { [P in keyof typeof Translation]: string };

export function createTranslation(table: TranslationTable): React.FunctionComponent<LangItemProps> {
    // return as a fragment that doesn't generate any additional DOM nodes
    return (props) => (<>{table[Translation[props.t]]}</>);
}

export enum Translation {
    Test_Avatar,
};
