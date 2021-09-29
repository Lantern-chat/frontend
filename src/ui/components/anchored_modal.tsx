import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useForceRender } from "ui/hooks/useForceRender";
import { Modal } from "./modal";
import { PositionedModal } from "./positioned_modal";

export interface IAnchoredModalProps {
    children?: React.ReactChild,
    show?: boolean,
}

export const AnchoredModal = React.memo((props: IAnchoredModalProps) => {
    let anchor_ref = useRef<HTMLSpanElement>(null),
        rect = props.show && anchor_ref.current?.getBoundingClientRect(),
        modal;

    if(props.show && rect) {
        let { top, left, bottom } = rect;

        modal = (
            <PositionedModal top={top} left={left} bottom={bottom}>
                {props.children}
            </PositionedModal>
        );
    }

    return (
        <>
            <span ref={anchor_ref} className="ln-context-anchor" />
            {modal}
        </>
    )
});

if(__DEV__) {
    AnchoredModal.displayName = "AnchoredModal";
}