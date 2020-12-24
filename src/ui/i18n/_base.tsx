import React from "react";

export interface TransLangProps {
    children: string,
}

export function createTranslation(table: Record<string, string>): React.ExoticComponent<TransLangProps> {
    // return as a fragment that doesn't generate any additional DOM nodes
    return React.memo((props) => (<>{table[props.children as string]}</>));
}

