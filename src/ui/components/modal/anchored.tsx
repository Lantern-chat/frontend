import { createEffect, createMemo, createRenderEffect, createSignal, onCleanup, Show, JSX } from "solid-js";
import { PositionedModal } from "./positioned";

export interface IAnchoredModalProps {
    children?: JSX.Element,
    show?: boolean,
    eat?: string[],
    animated?: boolean,
}

import "../context_menu/context_menu.scss";
export function AnchoredModal(props: IAnchoredModalProps) {
    let anchor: HTMLSpanElement | undefined;

    let [show, setShow] = createSignal(props.show);
    //let [closing, setClosing] = createSignal(false);

    createRenderEffect(() => {
        if(props.show) {
            setShow(true);
        } else if(props.animated) {
            let t = setTimeout(() => setShow(false), 300);
            //setClosing(true);
            onCleanup(() => clearTimeout(t));
        } else {
            setShow(false);
        }
    });

    return (
        <>
            <span ref={anchor} class="ln-context-anchor" />

            <Show when={show() && anchor!.getBoundingClientRect()}>
                {rect => (
                    <PositionedModal eat={props.eat} rect={rect()}>
                        {props.children}
                    </PositionedModal>
                )}
            </Show>
        </>
    )
}