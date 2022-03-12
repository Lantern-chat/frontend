import { createEffect, createMemo, createSignal, onCleanup, Show } from "solid-js";
import { useRef } from "ui/hooks/useRef";
import { PositionedModal } from "./positioned";

export interface IAnchoredModalProps {
    children?: any,
    show?: boolean,
    eat?: string[],
    animated?: boolean,
}

export function AnchoredModal(props: IAnchoredModalProps) {
    let anchor = useRef<HTMLSpanElement>();

    let [show, setShow] = createSignal(props.show);
    let [closing, setClosing] = createSignal(false);

    createEffect(() => {
        if(props.show) {
            setShow(true);
        } else if(props.animated) {
            let t = setTimeout(() => setShow(false), 300);
            setClosing(true);
            onCleanup(() => clearTimeout(t));
        } else {
            setShow(false);
        }
    });

    let rect = createMemo(() => show() && anchor.current?.getBoundingClientRect());

    return (
        <>
            <span ref={anchor} className="ln-context-anchor" />

            <Show when={rect()}>
                {({ top, left, bottom }) => (
                    <PositionedModal eat={props.eat} top={top} left={left} bottom={bottom}>
                        {props.children}
                    </PositionedModal>
                )}
            </Show>
        </>
    )
}