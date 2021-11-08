import React from "react";

import { countLines } from "lib/util";

import { ICodeProps } from "./code";

export interface ICodeWrapperprops extends ICodeProps {
    code: any,
}

import "./code_wrapper.scss";
export const CodeWrapper = React.memo((props: ICodeWrapperprops) => {
    let Inner = props.code,
        loc = countLines(props.src),
        block = <Inner {...props} />;

    if(loc < 20) {
        return block;
    }

    // encode "expand/collapse" switching in CSS using `details[open]`
    return (
        <details className="ln-code-details">
            <summary>
                Click to&nbsp;
                <span className="ln-code-details__closed">expand</span>
                <span className="ln-code-details__open">collapse</span>
                &nbsp;{loc} lines of code
            </summary>
            {block}
        </details>
    );
});

if(__DEV__) {
    CodeWrapper.displayName = "CodeWrapper";
}