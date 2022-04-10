import { createSignal, JSX } from "solid-js";
import { useSelector } from "solid-mutant";

import { UserPreferenceFlags } from "state/models";
import { selectPrefsFlag } from "state/selectors/prefs";

import { VectorIcon } from "ui/components/common/icon";
import { FullscreenModal, Modal } from "ui/components/modal";

import { createClickEater } from "ui/hooks/useMain";

export interface GenericModalProps {
    children?: JSX.Element,
    onClose?: () => void,
}

import { MenuCloseIcon } from "lantern-icons";

import "./modal.scss";
export function GenericModal(props: GenericModalProps) {
    let eat = createClickEater();

    let [closing, setClosing] = createSignal(false);

    let reduce_animations = useSelector(selectPrefsFlag(UserPreferenceFlags.ReduceAnimations));

    let on_close = () => {
        if(!reduce_animations()) {
            setClosing(true);
            setTimeout(() => props.onClose?.(), 100);
        } else {
            props.onClose?.();
        }
    };

    return (
        <FullscreenModal onClick={on_close} className="ln-generic-modal" classList={{ 'closing': closing() }}>
            <div className="ln-generic-modal__inner" onClick={eat}>
                <div className="ln-generic-modal__close" onClick={on_close}>
                    <VectorIcon src={MenuCloseIcon} />
                </div>
                {props.children}
            </div>
        </FullscreenModal>
    );
}