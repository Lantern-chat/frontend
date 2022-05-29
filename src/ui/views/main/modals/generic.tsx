import { createSignal, JSX, onCleanup, onMount } from "solid-js";

import { useRootSelector } from "state/root";
import { UserPreferenceFlags } from "state/models";
import { selectPrefsFlag } from "state/selectors/prefs";

import { VectorIcon } from "ui/components/common/icon";
import { FullscreenModal, Modal } from "ui/components/modal";

// NOTE: USED IN DIRECTIVE BELOW
import { clickEater } from "ui/hooks/useMain";
false && clickEater;

export interface GenericModalProps {
    children?: JSX.Element,
    onClose?: () => void,
}

import { Icons } from "lantern-icons";

import "./modal.scss";
export function GenericModal(props: GenericModalProps) {
    let [closing, setClosing] = createSignal(false);

    let reduce_animations = useRootSelector(selectPrefsFlag(UserPreferenceFlags.ReduceAnimations));

    let on_close = () => {
        if(!closing()) {
            setClosing(true);

            if(!reduce_animations()) {
                setTimeout(() => props.onClose?.(), 100);
            } else {
                props.onClose?.();
            }
        }
    };

    onMount(() => {
        let listener = (e: KeyboardEvent) => { if(e.key == 'Escape') { on_close(); } };
        window.addEventListener('keyup', listener);
        onCleanup(() => window.removeEventListener('keyup', listener));
    });

    return (
        <FullscreenModal onClick={on_close} class="ln-generic-modal" classList={{ 'closing': closing() }}>
            <div class="ln-generic-modal__inner" use:clickEater={["click"]}>
                <div class="ln-generic-modal__close" onClick={on_close}>
                    <VectorIcon id={Icons.MenuClose} />
                </div>
                {props.children}
            </div>
        </FullscreenModal>
    );
}