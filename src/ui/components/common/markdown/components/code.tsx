import { countLines } from "lib/util";
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

    let loc = countLines(src),
        block = <SyntaxHighlighter useInlineStyles={false} language={language} children={src.trim()} onTouchStart={ignoreTouch} />;

    if(loc < 20) {
        return block;
    }

    return (
        <details className="ln-code-details">
            <summary>Click to expand {loc} lines of code</summary>
            {block}
        </details>
    );
});

if(__DEV__) {
    Code.displayName = "Code";
}

export default Code;