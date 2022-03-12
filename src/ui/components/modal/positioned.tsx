import { createEffect, createMemo, createSignal, onCleanup } from "solid-js";
import { Modal } from "./";

export interface IPositionedModalProps {
    children?: any,
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

let stop_prop = (e: UIEvent) => e.stopPropagation();

export function PositionedModal(props: IPositionedModalProps) {
    let [dim, setDim] = createSignal(dimSelector());

    createEffect(() => {
        let listener = () => setDim(dimSelector());
        window.addEventListener('resize', listener);
        onCleanup(() => window.removeEventListener('resize', listener));
    });

    let eaten = createMemo(() => {
        let eaten = {};

        if(Array.isArray(props.eat) && props.eat.length) {
            for(let event of props.eat) {
                eaten[event] = stop_prop;
            }
        }

        return eaten;
    });

    let computed = createMemo(() => {
        let d = dim(),
            top = Math.min(props.top, d.height),
            left = Math.min(props.left, d.width),
            on_top = top < (d.height * 0.5),
            on_left = left < (d.width * 0.5),
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

        let wrapper_props = {
            style: { position: 'absolute' as const, left, top },
            className: cns.join(' '),
        };

        return {
            wrapper_props,
            style,
        };
    });

    return (
        <Modal>
            <div {...computed().wrapper_props} {...eaten}>
                <div style={computed().style}>
                    {props.children}
                </div>
            </div>
        </Modal>
    );
}