import type { JSX } from "solid-js";

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

    return (
        <FullscreenModal onClick={props.onClose} className="ln-generic-modal">
            <div className="ln-generic-modal__inner" onClick={eat}>
                <div className="ln-generic-modal__close" onClick={props.onClose}>
                    <VectorIcon src={MenuCloseIcon} />
                </div>
                {props.children}
            </div>
        </FullscreenModal>
    );
}