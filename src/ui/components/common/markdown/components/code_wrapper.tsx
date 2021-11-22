import React, { useCallback, useContext, useEffect, useRef, useState } from "react";

import { countLines } from "lib/util";

import { InfiniteScrollContext } from "ui/components/infinite_scroll2";

import { ICodeProps } from "./code";

export interface ICodeWrapperprops extends ICodeProps {
    code: any,
}

import "./code_wrapper.scss";
export const CodeWrapper = React.memo((props: ICodeWrapperprops) => {
    let Inner = props.code,
        loc = countLines(props.src),
        block = <Inner {...props} />, ifs = useContext(InfiniteScrollContext);

    if(loc < 20) {
        return block;
    }

    return <CollapsedCode {...props} loc={loc} block={block} />;
});

import { IS_IOS_SAFARI } from "lib/user_agent";

const CollapsedCode = React.memo((props: ICodeWrapperprops & { loc: number, block: React.ReactNode }) => {
    let ifs = useContext(InfiniteScrollContext),
        [open, setOpen] = useState(false);

    let onClick = (e: React.SyntheticEvent) => {
        if(!open) {
            ifs?.pause(true);

            // fucking Safari gets weird with `onToggle`, so just set a timeout instead
            if(IS_IOS_SAFARI) {
                setTimeout(() => ifs?.pause(false), 100);
            }
        }
        setOpen(!open);
        e.preventDefault();
    };

    let onToggle = () => { if(!IS_IOS_SAFARI) ifs?.pause(false); };

    // encode "expand/collapse" switching in CSS using `details[open]`
    return (
        <details className="ln-code-details" open={open} onClick={onClick} onToggle={onToggle}>
            <summary>
                Click to&nbsp;
                <span className="ln-code-details__closed">expand</span>
                <span className="ln-code-details__open">collapse</span>
                &nbsp;{props.loc} lines of code
            </summary>
            {props.block}
        </details>
    );
});

if(__DEV__) {
    CodeWrapper.displayName = "CodeWrapper";
    CollapsedCode.displayName = "CollapsedCode";
}