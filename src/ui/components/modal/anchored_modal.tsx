import React, { useRef } from "react";

import { PositionedModal } from "./positioned_modal";

export interface IAnchoredModalProps {
    children?: React.ReactChild,
    show?: boolean,
    eat?: string[],
}

export const AnchoredModal = React.memo((props: IAnchoredModalProps) => {
    let anchor_ref = useRef<HTMLSpanElement>(null),
        rect = props.show && anchor_ref.current?.getBoundingClientRect(),
        modal;

    if(props.show && rect) {
        let { top, left, bottom } = rect;

        modal = (
            <PositionedModal eat={props.eat} top={top} left={left} bottom={bottom}>
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