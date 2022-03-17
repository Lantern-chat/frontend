import { createMemo, createSignal, Show } from "solid-js";

import { countLines } from "lib/util";

// TODO: Reenable this
//import { InfiniteScrollContext } from "ui/components/infinite_scroll2";

import { Code, ICodeProps } from "../lazy";
//import Code, { ICodeProps } from "./code";


import "./code_wrapper.scss";
export function CodeWrapper(props: ICodeProps) {
    let loc = createMemo(() => countLines(props.src));

    return (
        <Show when={loc() >= 20} fallback={<Code {...props} />}>
            <CollapsedCode {...props} loc={loc()} />
        </Show>
    );
}

import { IS_IOS_SAFARI } from "lib/user_agent";

function CollapsedCode(props: ICodeProps & { loc: number }) {
    let //ifs = useContext(InfiniteScrollContext),
        [open, setOpen] = createSignal(false);

    let onClick = (e: MouseEvent) => {
        //ifs?.pause(true);

        // fucking Safari gets weird with `onToggle`, so just set a timeout instead
        //if(IS_IOS_SAFARI) {
        //    setTimeout(() => ifs?.pause(false), 100);
        //}

        __DEV__ && console.log("CLICKED");
        setOpen(v => !v);
        e.preventDefault();
    };

    let onToggle = () => {
        if(!IS_IOS_SAFARI) {
            __DEV__ && console.log("TOGGLED");
            //ifs?.pause(false);
        }
    };

    // encode "expand/collapse" switching in CSS using `details[open]`
    return (
        <details className="ln-code-details" open={open()} onToggle={onToggle}>
            <summary onClick={onClick}>
                Click to&nbsp;
                <span className="ln-code-details__closed">expand</span>
                <span className="ln-code-details__open">collapse</span>
                &nbsp;{props.loc} lines of code
            </summary>
            <Code {...props} />
        </details>
    );
}