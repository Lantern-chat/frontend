import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useForceRender } from "ui/hooks/useForceRender";
import { Modal } from "./modal";

export interface IPositionedModalProps {
    children?: React.ReactChild,
    top: number,
    left: number,
    bottom?: number,
    right?: number,
}

interface WindowDim {
    width: number,
    height: number,
}

function dimSelector(): WindowDim {
    return {
        width: window.innerWidth,
        height: window.innerHeight,
    };
}

export const PositionedModal = React.memo((props: IPositionedModalProps) => {
    let [dim, setDim] = useState(dimSelector());

    // don't go through Redux for this, to avoid a ton of updates
    useEffect((): any => {
        let listener = () => setDim(dimSelector());
        window.addEventListener('resize', listener);
        return () => window.removeEventListener('resize', listener);
    }, []);

    let top = Math.min(props.top, dim.height),
        left = Math.min(props.left, dim.width),
        on_top = top < (dim.height * 0.5),
        on_left = left < (dim.width * 0.5),
        style: any = {
            position: 'absolute'
        };

    if(on_top) {
        if(props.bottom !== undefined) {
            top = props.bottom;
        }

        style.top = '0%';
    } else {
        style.bottom = '100%';
    }

    if(on_left) {
        style.left = '0%';
    } else {
        style.right = '100%';
    }

    return (
        <Modal>
            <div style={{ position: 'absolute', left, top }}>
                <div style={style}>
                    {props.children}
                </div>
            </div>
        </Modal>
    );
});

if(__DEV__) {
    PositionedModal.displayName = "PositionedModal";
}