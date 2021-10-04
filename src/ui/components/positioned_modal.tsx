import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useForceRender } from "ui/hooks/useForceRender";
import { Modal } from "./modal";

export interface IPositionedModalProps {
    children?: React.ReactChild,
    top: number,
    left: number,
    bottom?: number,
    right?: number,
    eat?: string[],
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
        }, cnp = 'ln-modal-', cns = [];

    cns.push(cnp + (on_top ? 'top' : 'bottom'));
    cns.push(cnp + (on_left ? 'left' : 'right'));

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

    let stop_prop = useCallback((e: React.SyntheticEvent) => e.stopPropagation(), []);

    let eat_props = {};
    if(Array.isArray(props.eat) && props.eat.length) {
        for(let event of props.eat) {
            eat_props[event] = stop_prop;
        }
    }

    return (
        <Modal>
            <div style={{ position: 'absolute', left, top }} {...eat_props} className={cns.join(' ')}>
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