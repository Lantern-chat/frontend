import React, { useContext, useCallback } from "react";
import { VectorIcon } from "ui/components/common/icon";
import { FullscreenModal, Modal } from "ui/components/modal";

import { useClickEater } from "ui/hooks/useMainClick";

export interface GenericModalProps {
    children?: React.ReactNode,
    onClose?: () => void,
}

import { MenuCloseIcon } from "ui/assets/icons";

import "./modal.scss";
export const GenericModal = React.memo((props: GenericModalProps) => {
    let eat = useClickEater();

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
});

if(__DEV__) {
    GenericModal.displayName = "GenericModal";
}