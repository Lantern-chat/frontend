import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "state/root";
import { useForceRender } from "ui/hooks/useForceRender";
import { Modal } from "../modal";

export interface IContextMenuProps {
    children: React.ReactChild,
    show: boolean,
}

export const ContextMenu = React.memo((props: IContextMenuProps) => {
    let anchor_ref = useRef<HTMLSpanElement>(null);

    let { height, width } = useSelector((state: RootState) => state.window);
    let forceRender = useForceRender();

    useLayoutEffect(() => forceRender(), []);

    useEffect(() => {
        let listener = () => forceRender();

        document.addEventListener('scroll', listener);
        return () => document.removeEventListener('scroll', listener);
    }, [props]);

    let anchor_span = <span ref={anchor_ref} className="ln-context-anchor" />, modal;

    let rect = anchor_ref.current?.getBoundingClientRect();

    if(props.show && rect) {
        let { top, left, bottom } = rect;

        let on_top = top < (height * 0.5);
        let on_left = left < (width * 0.5);

        let style: any = {
            position: 'relative'
        };

        if(on_top) {
            style.top = '0%';
        } else {
            style.bottom = '0%';
        }

        if(on_left) {
            style.left = '100%';
        } else {
            style.right = '100%';
        }

        modal = (
            <Modal>
                <div style={{ position: 'absolute', top: bottom, left }}>
                    <div style={style}>
                        {props.children}
                    </div>
                </div>
            </Modal>
        );
    }

    return (
        <>
            {anchor_span}
            {modal}
        </>
    );
});