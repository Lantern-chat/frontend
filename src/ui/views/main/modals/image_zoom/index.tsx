import classNames from "classnames";
import { format_bytes } from "lib/formatting";
import React, { useCallback, useMemo, useReducer, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { UserPreferenceFlags } from "state/models";
import { selectPrefsFlag } from "state/selectors/prefs";

import { FullscreenModal } from "ui/components/modal";

import { Hotkey, useClickEater, useMainHotkey } from "ui/hooks/useMainClick";

enum LbActType {
    Load,
    SetPan,
    SetZoom,
    Pan,
    Zoom,
    Clamp,
}

interface LbLoadAction {
    t: LbActType.Load,
    width: number,
    height: number,
}

interface LbSetPanAction {
    t: LbActType.SetPan,
    panning: boolean,
}

interface LbSetZoomAction {
    t: LbActType.SetZoom,
    zooming: boolean,
}

interface LbPanAction {
    t: LbActType.Pan,
    dx: number,
    dy: number,
}

interface LbZoomAction {
    t: LbActType.Zoom,
    dz: number,
    o?: [number, number]
}

interface LbClampAction {
    t: LbActType.Clamp,
    mx: number,
    my: number,
}

type LightboxAction = LbLoadAction | LbSetPanAction | LbSetZoomAction | LbPanAction | LbZoomAction | LbClampAction;

interface LightboxState {
    width: number,
    height: number,
    x: number, // position relative to origin of image within 4 quadrants
    y: number, // position relative to origin of image within 4 quadrants
    z: number,
    is_panning: boolean,
    is_zooming: boolean,
}

const DEFAULT_STATE: LightboxState = { width: 0, height: 0, x: 0, y: 0, z: 1, is_panning: false, is_zooming: false };

function lb_reducer(state: LightboxState, action: LightboxAction): LightboxState {
    switch(action.t) {
        case LbActType.Load: {
            let { width, height } = action;
            return { ...state, width, height };
        }
        case LbActType.SetPan: {
            return { ...state, is_panning: action.panning };
        }
        case LbActType.SetZoom: {
            return { ...state, is_zooming: action.zooming };
        }
        case LbActType.Pan: {
            let { dx, dy } = action;
            return { ...state, x: state.x + dx, y: state.y + dy };
        }
        case LbActType.Zoom: {
            let { dz, o } = action;

            let z = Math.max(-1.5, Math.min(3, state.z + dz));

            if(z == state.z) break; // at limits most likely

            let [ox, oy] = o || [0, 0],
                e = Math.exp(z - state.z);

            // let m0 = Math.exp(state.z - 1),
            //     m1 = Math.exp(z - 1);
            // relocate origins to cursor, undo current zoom, do new zoom, shift back origin
            // let x = (state.x - ox) / m0 * m1 + ox;
            // let y = (state.y - oy) / m0 * m1 + oy;

            // optimized version of above
            let x = (state.x - ox) * e + ox;
            let y = (state.y - oy) * e + oy;

            return { ...state, z, x, y };
        }
        case LbActType.Clamp: {
            let { mx, my } = action;

            let x = Math.min(mx, Math.max(-mx, state.x));
            let y = Math.min(my, Math.max(-my, state.y));

            return { ...state, x, y };
        }
    }

    return state;
}

export interface ILightBoxProps {
    src: string,
    title?: string,
    size?: number,
    onClose(): void;
}

import "./lightbox.scss";
export const LightBox = React.memo(({ src, title, size, onClose }: ILightBoxProps) => {
    let reduce_motion = useSelector(selectPrefsFlag(UserPreferenceFlags.ReduceAnimations));

    let img = useRef<HTMLImageElement>(null),
        container_ref = useRef<HTMLDivElement>(null),
        eat = useClickEater(),
        wx = window.innerWidth, wy = window.innerHeight,
        [closing, setClosing] = useState(false),
        [state, dispatch] = useReducer(lb_reducer, DEFAULT_STATE);

    let on_load = useCallback(() => {
        let i = img.current;
        if(i) {
            dispatch({ t: LbActType.Load, width: i.naturalWidth, height: i.naturalHeight });
        }
    }, [img.current]);

    let do_close = useCallback(() => {
        if(reduce_motion) return onClose();

        setClosing(true);
        setTimeout(() => onClose(), 150);
    }, [onClose, reduce_motion]);
    useMainHotkey(Hotkey.Escape, () => do_close(), [do_close]);

    // `at` is a position on the PAGE, not SCREEN. The screen extends beyond the page
    let do_zoom = (dz: number, at: [number, number]) => {
        let i = img.current!,
            rect = i.getBoundingClientRect(),
            [x, y] = at,
            is_inside = (rect.left < x && x < rect.right) && (rect.top < y && y < rect.bottom),
            o: [number, number] | undefined;

        if(is_inside) {
            let container_rect = container_ref.current!.getBoundingClientRect();

            o = [
                (x - container_rect.left) - container_rect.width * 0.5,
                (y - container_rect.top) - container_rect.height * 0.5,
            ];
        }

        dispatch({ t: LbActType.Zoom, dz: dz, o });
    };

    interface IMouseState {
        // current coordinates
        x: number,
        y: number,

        // starting coordinates
        sx: number,
        sy: number,

        /// click timer, for detecting if a click was a click or the start of a drag
        ct?: number,

        /// current number of clicks
        c: number,

        // mode, 0 = pan, 1 = zoom
        d: 0 | 1,
    }

    let mouse = useRef<IMouseState>({ x: 0, y: 0, c: 0, sx: 0, sy: 0, d: 0 });

    let on_mousedown = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
        if(e.button != 0) return;

        let m = mouse.current;
        m.sx = m.x = e.pageX;
        m.sy = m.y = e.pageY;

        dispatch({ t: LbActType.SetPan, panning: true });

        // setup click handler. If mouseup is received before this timeout, then the click persists, otherwise it was a drag
        m.c++;
        m.ct = setTimeout(() => { m.c = 0; }, 300);

        e.preventDefault();
    }, []);

    let on_mouseup = (e: React.MouseEvent<HTMLImageElement>) => {
        if(!state.is_panning) return;

        let pan = true, m = mouse.current, { x, y, ct, c } = m;

        if(c > 0) {
            clearTimeout(ct); // no longer panning

            let dist = Math.hypot(m.x - m.sx, m.y - m.sy);

            if(dist > 20) {
                c = m.c = 0;
            } else if(c == 2) {
                m.c = 0; // reset

                let z = (state.z > 1 || state.z < 1) ? 1 : 2;

                // force absolute z to dz
                do_zoom(z - state.z, [e.pageX, e.pageY]);

                pan = false;
            }
        }

        if(pan && !closing) {
            dispatch({ t: LbActType.Pan, dx: e.pageX - x, dy: e.pageY - y });
        }

        dispatch({ t: LbActType.SetPan, panning: false });
    };

    let on_mousemove = (e: React.MouseEvent<HTMLImageElement>) => {
        let m = mouse.current;

        if(state.is_panning && !closing) {
            dispatch({ t: LbActType.Pan, dx: e.pageX - m.x, dy: e.pageY - m.y });
        }

        m.x = e.pageX;
        m.y = e.pageY;

        e.preventDefault();
    };

    let scale = Math.exp(state.z - 1);

    let on_wheel = useCallback((e: React.WheelEvent<HTMLImageElement>) => {
        let { x, y } = mouse.current;

        do_zoom(e.deltaY / -500, [x, y]);
    }, [img.current, container_ref.current]);

    let on_click_image = (e: React.MouseEvent) => {
        e.stopPropagation();
    }, on_click_background = (e: React.MouseEvent) => {
        e.stopPropagation();
        if(!state.is_panning) do_close(); // protect against fast/lagging panning
    };

    let footer = useMemo(() => {
        let footer = [];
        title && footer.push(title);
        size && footer.push(`${format_bytes(size)}`);

        return footer.join(' — ');
    }, [title, size]);

    let zoom_level = useMemo(() => {
        let i = img.current;
        if(i) {
            return Math.round(i.clientWidth * scale / state.width * 100).toLocaleString("en-US") + '%';
        }
        return;
    }, [scale, state.width]);

    return (
        <FullscreenModal>
            <div className={classNames("ln-lightbox", { closing })}
                onClick={on_click_background} onContextMenu={eat}
                onMouseMove={on_mousemove} onMouseUp={on_mouseup} onWheel={on_wheel}
            >
                <div className="ln-lightbox__container" ref={container_ref}>
                    <img src={src} ref={img}
                        onLoad={on_load}
                        onClick={on_click_image}
                        onMouseDown={on_mousedown}

                        style={{
                            cursor: state.is_panning ? 'grabbing' : (mouse.current.c > 0 ? (state.z > 1 ? 'zoom-out' : 'zoom-in') : 'grab'),
                            transition: (reduce_motion || state.is_panning) ? 'none' : 'transform 0.05s ease-in',
                            transform: `translate(${state.x}px, ${state.y}px) scale(${scale})`
                        }}
                    />
                </div>

                <div className="ln-lightbox__footer ui-text" onClick={on_click_image}>
                    {footer} <span className="ln-lightbox-zoom">{zoom_level}</span>
                </div>
            </div>
        </FullscreenModal>
    );
});

if(__DEV__) {
    LightBox.displayName = "LightBox";
}