import { createSignal, JSX, onCleanup, onMount } from "solid-js";

import { usePrefs } from "state/contexts/prefs";

import { VectorIcon } from "ui/components/common/icon";
import { FullscreenModal, Modal } from "ui/components/modal";

export interface GenericModalProps {
    children?: JSX.Element,
    onClose?: () => void,
    blur?: boolean,
    dim?: boolean,
    id?: string,
    strong?: boolean,
}

import { Icons } from "lantern-icons";

import "./modal.scss";
export function GenericModal(props: GenericModalProps) {
    const [closing, setClosing] = createSignal(false);

    const reduce_animations = usePrefs().ReduceAnimations;

    const on_close = () => {
        if(!closing() && (!__DEV__ || props.onClose)) {
            setClosing(true);

            if(!reduce_animations()) {
                setTimeout(() => props.onClose?.(), 100);
            } else {
                props.onClose?.();
            }
        }
    };

    onMount(() => {
        const listener = (e: KeyboardEvent) => { if(e.key == "Escape") { on_close(); } };
        window.addEventListener("keyup", listener);
        onCleanup(() => window.removeEventListener("keyup", listener));
    });

    return (
        <FullscreenModal onClick={props.strong ? undefined : on_close}
            class="ln-generic-modal" classList={{ "closing": closing(), "dim": props.dim }}
            id={props.id} blur={props.blur}
        >
            <div class="ln-generic-modal__inner" onClick={e => e.stopPropagation()}>
                <div class="ln-generic-modal__close" onClick={on_close}>
                    <VectorIcon id={Icons.Close} />
                </div>
                {props.children}
            </div>
        </FullscreenModal>
    );
}