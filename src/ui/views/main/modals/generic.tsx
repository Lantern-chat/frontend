import React from "react";
import { Glyphicon } from "ui/components/common/glyphicon";
import { FullscreenModal, Modal } from "ui/components/modal";

export interface GenericModalProps {
    children?: React.ReactNode,
    onClose?: () => void,
}

import MenuClose from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-599-menu-close.svg";

import "./modal.scss";
export const GenericModal = React.memo((props: GenericModalProps) => {
    return (
        <FullscreenModal onClick={props.onClose} className="ln-generic-modal">
            <div className="ln-generic-modal__inner" onClick={e => e.stopPropagation()}>
                <div className="ln-generic-modal__close" onClick={props.onClose}>
                    <Glyphicon src={MenuClose} />
                </div>
                {props.children}
            </div>
        </FullscreenModal>
    );
});