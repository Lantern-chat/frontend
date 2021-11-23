import classNames from "classnames";
import { format_bytes } from "lib/formatting";
import React, { useCallback, useMemo, useReducer, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { UserPreferenceFlags } from "state/models";
import { selectPrefsFlag } from "state/selectors/prefs";

import { FullscreenModal } from "ui/components/modal";
import { Glyphicon } from "ui/components/common/glyphicon";

import { Hotkey, useClickEater, useMainHotkey } from "ui/hooks/useMainClick";

enum LbActType {
    Load,
    SetPan,
    SetZoom,
    Pan,
    Zoom,
    Clamp,
    Rotate,
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

interface LbRotateAction {
    t: LbActType.Rotate,
    a: number,
}

type LightboxAction = LbLoadAction | LbSetPanAction | LbSetZoomAction | LbPanAction | LbZoomAction | LbClampAction | LbRotateAction;

interface LightboxState {
    width: number,
    height: number,
    x: number, // position relative to origin of image within 4 quadrants
    y: number, // position relative to origin of image within 4 quadrants
    z: number,
    a: number,
    is_panning: boolean,
    is_zooming: boolean,
}

const DEFAULT_STATE: LightboxState = { width: 0, height: 0, x: 0, y: 0, z: 1, a: 0, is_panning: false, is_zooming: false };

function lb_reducer(state: LightboxState, action: LightboxAction): LightboxState {
    switch(action.t) {
        case LbActType.Pan: {
            let { dx, dy } = action;
            return { ...state, x: state.x + dx, y: state.y + dy };
        }
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
        case LbActType.Rotate: {
            return { ...state, a: (state.a + action.a) % 360 };
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

import RotateIcon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-493-rotate.svg";
import ZoomIcon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-28-search.svg";

const MOMENTUM: number = 0.1;

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

        vx: number,
        vy: number,

        /// click timer, for detecting if a click was a click or the start of a drag
        ct?: number,
        /// Panning timer, for detecting if the mouse is moving or not
        pt?: number,

        /// current number of clicks
        c: number,

        // mode, 0 = pan, 1 = zoom, 2 = momentum
        d: 0 | 1 | 2,
    }

    let mouse = useRef<IMouseState>({ x: 0, y: 0, c: 0, sx: 0, sy: 0, vx: 0, vy: 0, d: 0 });

    let on_mousedown = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
        if(e.button != 0) return;

        let m = mouse.current;
        m.sx = m.x = e.pageX;
        m.sy = m.y = e.pageY;

        m.vx = m.vy = 0;

        dispatch({ t: LbActType.SetPan, panning: true });

        // setup click handler. If mouseup is received before this timeout, then the click persists, otherwise it was a drag
        m.c++;
        m.ct = setTimeout(() => { m.c = 0; m.d = 0; }, 300);

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
                m.d = m.c = 0; // reset

                let z = 1, // zoom to fit by default
                    o: [number, number] = [e.pageX, e.pageY],
                    { width, height } = state,
                    i = img.current!,
                    cont = container_ref.current!,
                    cont_width = cont.clientWidth,
                    cont_height = cont.clientHeight,
                    client_width = i.clientWidth,
                    fits_on_screen = width == client_width;

                // at natural rendered size
                if(state.z == 1) {
                    if(fits_on_screen) {
                        // fit to screen
                        z = Math.log(Math.min(cont_width / width, cont_height / height)) + 1;
                    } else {
                        // zoom to 100%
                        z = Math.log(width / client_width) + 1;
                    }
                }

                if(fits_on_screen) {
                    // compute relative proportion of image within container
                    let dw = (cont_width - width) / cont_width,
                        dh = (cont_height - height) / cont_height;

                    // if the image fills less than 75% of the screen, keep it to center
                    if(Math.max(dw, dh) > 0.25) {
                        o = [0, 0];
                    }
                }

                // force absolute z to dz
                do_zoom(z - state.z, o);

                pan = false;
            }
        }

        //m.vx = (m.vx * 0.3 + (e.pageX - m.x) * 0.7);
        //m.vy = (m.vy * 0.3 + (e.pageY - m.y) * 0.7);

        dispatch({ t: LbActType.SetPan, panning: false });

        if(pan && !closing && !reduce_motion) {
            if(!(m.vx != 0 || m.vy != 0)) return;

            let dx = m.vx * 5, dy = m.vy * 5;

            m.d = 2; // enable momentum

            setTimeout(() => { if(m.d == 2) m.d = 0; }, 500); // allow for animation

            dispatch({ t: LbActType.Pan, dx, dy });
        }
    };

    let on_mousemove = useCallback((e: React.MouseEvent<HTMLImageElement>) => {
        let m = mouse.current;

        if(state.is_panning && !closing) {
            let dx = e.pageX - m.x,
                dy = e.pageY - m.y;

            // EMA
            m.vx = (m.vx + dx) * 0.5;
            m.vy = (m.vy + dy) * 0.5;

            // if we do not receive another mousemove event, remove velocity
            clearTimeout(m.pt);
            m.pt = setTimeout(() => { if(m.d == 0) { m.vx = m.vy = 0; } }, 100);

            dispatch({ t: LbActType.Pan, dx, dy });
        }

        m.x = e.pageX;
        m.y = e.pageY;

        e.preventDefault();
    }, [state.is_panning, closing]);

    let scale = Math.exp(state.z - 1);

    let on_wheel = useCallback((e: React.WheelEvent<HTMLImageElement>) => {
        let m = mouse.current;
        m.d = 1;
        do_zoom(e.deltaY / -500, [m.x, m.y]);
    }, [img.current, container_ref.current]);

    let on_click_image = (e: React.MouseEvent) => {
        e.stopPropagation();
    }, on_click_background = (e: React.MouseEvent) => {
        e.stopPropagation();
        if(!state.is_panning) do_close(); // protect against fast/lagging panning
    };

    let meta = useMemo(() => {
        let bytes = size ? format_bytes(size) : 'Unknown size';
        return `${state.width} x ${state.height} (${bytes})`
    }, [size, state.width]);

    let zoom_level = useMemo(() => {
        let i = img.current;
        if(i) {
            return Math.round(i.clientWidth * scale / state.width * 100).toLocaleString("en-US") + '%';
        }
        return;
    }, [scale, state.width]);

    // TODO: Clicking on footer and dragging to image triggers on_click_background

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
                            transition: (reduce_motion || state.is_panning) ? 'none' : (mouse.current.d == 2 ? 'transform 0.5s cubic-bezier(0, 0.55, 0.45, 1)' : `transform 0.065s ease-out`),
                            transform: `translate(${state.x}px, ${state.y}px) scale(${scale})`
                        }}
                    />
                </div>

                <div className="ln-lightbox__footer ui-text" onClick={on_click_image}>
                    <div className="ln-lightbox__controls">
                        <span id="zoom-in"><Glyphicon src={ZoomIcon} /></span>
                        <span id="zoom-out"><Glyphicon src={ZoomIcon} /></span>
                        <span id="rotate-cc"><Glyphicon src={RotateIcon} /></span>
                        <span id="rotate-cl"><Glyphicon src={RotateIcon} /></span>
                    </div>
                    <span>
                        <span className="ln-lightbox-title">{title}</span>
                        <span> — {meta}</span>
                        <span className="ln-lightbox-zoom">{zoom_level}</span>
                    </span>
                </div>
            </div>
        </FullscreenModal>
    );
});

if(__DEV__) {
    LightBox.displayName = "LightBox";
}