import React from "react";

import SyntaxHighlighter from 'react-syntax-highlighter'

import "ui/fonts/hasklig";
import "./code.scss";

export interface ICodeProps {
    src: string,
    language?: string,
}

const Code = React.memo(({ language, src }: ICodeProps) => {
    return (
        <SyntaxHighlighter useInlineStyles={false} language={language} children={src.trim()} />
    );
});

if(__DEV__) {
    Code.displayName = "Code";
}

export default Code;