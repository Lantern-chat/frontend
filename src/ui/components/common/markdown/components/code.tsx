import React from "react";

import SyntaxHighlighter from 'react-syntax-highlighter'

import "ui/fonts/hasklig";
import "./code.scss";

export interface ICodeProps {
    src: string,
    language?: string,
}

function ignoreTouch(e: React.TouchEvent) {
    e.stopPropagation();
}

const Code = React.memo(({ language, src }: ICodeProps) => {
    if(!language) {
        return (
            <pre className="hljs" onTouchStart={ignoreTouch}>
                <code>{src.trim()}</code>
            </pre>
        );
    }

    return (
        <SyntaxHighlighter useInlineStyles={false} language={language} children={src.trim()} onTouchStart={ignoreTouch} />
    );
});

if(__DEV__) {
    Code.displayName = "Code";
}

export default Code;