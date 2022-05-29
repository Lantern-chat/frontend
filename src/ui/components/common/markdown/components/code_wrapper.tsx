import { createMemo, createSignal, Show, useContext } from "solid-js";

import { countLines } from "lib/util";

import { InfiniteScrollContext } from "ui/components/infinite_scroll";

import { Code, ICodeProps } from "../lazy";

import "./code_wrapper.scss";
export function CodeWrapper(props: ICodeProps) {
    let loc = createMemo(() => countLines(props.src));

    return (
        <Show when={loc() >= 20} fallback={<Code {...props} />}>
            <CollapsedCode {...props} loc={loc()} />
        </Show>
    );
}

function CollapsedCode(props: ICodeProps & { loc: number }) {
    let ifs = useContext(InfiniteScrollContext),
        [open, setOpen] = createSignal(false);

    let t: number;

    let onClick = (e: MouseEvent) => {
        clearTimeout(t);

        ifs?.()?.pause(true);

        __DEV__ && console.log("CLICKED");
        setOpen(v => !v);
        e.preventDefault();
    };

    let onToggle = () => {
        __DEV__ && console.log("TOGGLED");

        // resize events may lag behind a bit, so give it a frame or two to catch up.
        t = setTimeout(() => ifs?.()?.pause(false), 100);
    };

    // encode "expand/collapse" switching in CSS using `details[open]`
    return (
        <details class="ln-code-details" open={open()} onToggle={onToggle}>
            <summary onClick={onClick}>
                Click to&nbsp;
                <span class="ln-code-details__closed">expand</span>
                <span class="ln-code-details__open">collapse</span>
                &nbsp;{props.loc} lines of code
            </summary>
            <Code {...props} />
        </details>
    );
}