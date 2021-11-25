import classNames from "classnames";
import React, { createRef, useRef } from "react";
import { useSelector } from "react-redux";

import { format_bytes } from "lib/formatting";

import { UserPreferenceFlags } from "state/models";
import { selectPrefsFlag } from "state/selectors/prefs";

import { FullscreenModal } from "ui/components/modal";
import { Hotkey, useMainHotkeys } from "ui/hooks/useMainClick";

/// State that requires re-rendering when updated
interface ILightBoxState {
    closing: boolean,
    nat_width: number,
    nat_height: number,

    // cached zoom percentage string
    zoom_level: string,
}

enum Mode {
    Idle = 0,
    Momentum = 1,
    Panning = 2,
    Zooming = 3,
}

interface IMouseState {
    /// Time of last mouse event
    t: number,

    /// Current mouse position
    x: number, y: number,

    /// Mouse starting position (when clicked and dragged)
    sx: number, sy: number,

    /// Mouse velocity
    vx: number, vy: number,

    mode: Mode,

    c: number,
}

interface IImageState {
    /// Image translation
    x: number, y: number,

    /// Zoom and scale value
    z: number, scale: number,

    zmin: number, zmax: number,
    zfit: number, z100: number,
}

export interface ILightBoxProps {
    src: string,
    title?: string,
    size?: number,
    reduce_motion?: boolean,

    onClose(): void;
}

const LN5_00 = Math.log(5.00);
const LN0_05 = Math.log(0.05);

import "../lightbox/lightbox.scss";
export class LightBoxInner extends React.Component<ILightBoxProps, ILightBoxState> {
    constructor(props: ILightBoxProps) {
        super(props);

        this.state = {
            closing: false,
            nat_height: 0,
            nat_width: 0,
            zoom_level: '%'
        };

        window['lightbox'] = this;
    }

    img: React.RefObject<HTMLImageElement> = createRef();
    container: React.RefObject<HTMLDivElement> = createRef();

    m: IMouseState = {
        t: 0,

        x: 0, y: 0,

        sx: 0, sy: 0,

        vx: 0, vy: 0,

        mode: Mode.Idle,

        c: 0,
    };

    i: IImageState = {
        x: 0, y: 0,
        z: 1, scale: 1,
        zmin: -1.5, zmax: 3.5,
        z100: 1, zfit: 1,
    };

    close() {
        let { reduce_motion, onClose } = this.props;

        if(reduce_motion) return onClose();

        this.setState({ closing: true });
        setTimeout(() => onClose(), 150);
    }

    compute_img_rect(): undefined | Pick<DOMRect, 'width' | 'height' | 'left' | 'right' | 'top' | 'bottom'> {
        let img = this.img.current, state = this.i;
        if(!img) return;

        let scale = state.scale,
            width = img.offsetWidth,
            height = img.offsetHeight,
            scaled_width = width * scale,
            scaled_height = height * scale,
            dw = width - scaled_width,
            dh = height - scaled_height;

        let left = img.offsetLeft + state.x + dw * 0.5,
            top = img.offsetTop + state.y + dh * 0.5,
            right = left + scaled_width,
            bottom = top + scaled_height;

        return {
            width: scaled_width,
            height: scaled_height,
            left, right, top, bottom
        }
    }

    check_bounds() {
        let state = this.i,
            cont = this.container.current!,
            cont_width = cont.clientWidth,
            cont_height = cont.clientHeight,
            rect = this.compute_img_rect()!;

        // if less than or equal to container size
        if(state.scale <= 1 || (state.z100 <= 1 && state.z <= state.zfit)) {
            // left border
            state.x -= Math.min(0, rect.left);
            // top border
            state.y -= Math.min(0, rect.top);
            // right border
            state.x -= Math.max(0, rect.right - cont_width);
            // bottom border
            state.y -= Math.max(0, rect.bottom - cont_height);
        } else {
            let min_dimension = Math.min(cont_width, cont_height),
                margin = min_dimension * 0.35,
                max_left = cont_width - margin,
                max_right = margin,
                max_top = cont_height - margin,
                max_bottom = margin;

            state.x += Math.min(0, max_left - rect.left);
            state.x += Math.max(0, max_right - rect.right);

            state.y += Math.min(0, max_top - rect.top);
            state.y += Math.max(0, max_bottom - rect.bottom);
        }
    }

    do_translate(dx: number, dy: number) {
        if(dx == dy && dy == 0 || this.state.nat_height == 0) return;

        let state = this.i;
        state.x += dx;
        state.y += dy;

        this.check_bounds();

        this.request_animation_update();
    }

    do_zoom(dz: number, at?: [number, number]) {
        if(this.state.nat_height == 0) return;

        let state = this.i, z = Math.max(state.zmin, Math.min(state.zmax, state.z + dz));

        if(state.z == z) return; // at limit most likely

        if(at) {
            let i = this.img.current!,
                rect = i.getBoundingClientRect(),
                [x, y] = at,
                is_inside = (rect.left < x && x < rect.right) && (rect.top < y && y < rect.bottom);

            // apply relative zoom if and only if the anchor is inside the image on-screen
            if(is_inside && !(x == y && y == 0)) {
                let container_rect = this.container.current!.getBoundingClientRect(),
                    ox = (x - container_rect.left) - container_rect.width * 0.5,
                    oy = (y - container_rect.top) - container_rect.height * 0.5,
                    e = Math.exp(z - state.z);

                // let m0 = Math.exp(state.z - 1),
                //     m1 = Math.exp(z - 1);
                // relocate origins to cursor, undo current zoom, do new zoom, shift back origin
                // let x = (state.x - ox) / m0 * m1 + ox;
                // let y = (state.y - oy) / m0 * m1 + oy;

                // optimized version of above
                state.x = (state.x - ox) * e + ox;
                state.y = (state.y - oy) * e + oy;
            }
        }

        state.z = z;
        state.scale = Math.exp(z - 1);

        this.check_bounds();
        this.recompute_zoom_level();
        this.request_animation_update();
        this.update_ui();
    }

    recompute_zoom_level() {
        let img = this.img.current;
        if(img) {
            let zoom_level = Math.round(img.clientWidth * this.i.scale / this.state.nat_width * 100).toLocaleString('en-US') + '%';
            this.setState(prev => ({ ...prev, zoom_level }));
        }
    }

    // TODO: Setup a resize observer for this
    recompute_zoom_bounds() {
        let i = this.i,
            img = this.img.current!,
            cont = this.container.current!,
            nat_width = img.naturalWidth,
            nat_height = img.naturalHeight,
            cont_width = cont.clientWidth,
            cont_height = cont.clientHeight;

        i.z100 = Math.log(Math.max(nat_width / cont_width, nat_height / cont_height)) + 1;
        i.zfit = Math.log(Math.min(cont_width / nat_width, cont_height / nat_height)) + 1;
        i.zmin = Math.max(i.z100, i.zfit) + LN0_05; // 5% of 100% or fit
        i.zmax = Math.max(i.z100 + LN5_00, i.zfit); // 500% or fit

        this.do_zoom(0); // apply any bounds checking
    }

    on_load() {
        let img = this.img.current, cont = this.container.current;
        if(img && cont) {
            let nat_width = img.naturalWidth,
                nat_height = img.naturalHeight,
                zoom_level = Math.round(img.clientWidth * this.i.scale / nat_width * 100).toLocaleString('en-US') + '%';

            this.recompute_zoom_bounds();

            __DEV__ && console.log("Image State after Load: ", this.i);

            this.setState((prev) => ({ ...prev, nat_width, nat_height, zoom_level }));
        }
    }

    on_click(e: React.MouseEvent) {
        let mode = this.m.mode;

        // if not panning or zooming, allow close
        if(mode != Mode.Panning && mode != Mode.Zooming) {
            //console.log("MOUSE CLICK: ", Mode[mode]);
            this.close();
        }
    }

    on_mousedown_external(e: React.MouseEvent) {
        if(e.button == 1) this.on_mousedown(e);
        e.stopPropagation();
    }

    /// Click timer
    ct?: number;

    on_mousedown(e: React.MouseEvent) {
        let m = this.m, was_momentum = m.mode == Mode.Momentum;

        if(e.button == 0) { m.mode = Mode.Panning; }
        else if(e.button == 1) { m.mode = Mode.Zooming; }
        else return;

        m.sx = m.x = e.pageX;
        m.sy = m.y = e.pageY;

        let now = performance.now();

        if(was_momentum) {
            let dt = (now - m.t) / 500,
                t0 = dt >= 1 ? 0 : Math.pow(2, -10 * dt);

            let dx = m.vx * -100 * t0,
                dy = m.vy * -100 * t0;

            this.do_translate(dx, dy);
        }

        m.vx = m.vy = 0;
        m.t = now;

        if(e.button == 0) {
            m.c++;
            clearTimeout(this.ct);
            this.ct = setTimeout(() => { m.c = 0; }, 300);
        }

        this.update_ui();

        e.preventDefault();
        e.stopPropagation(); // must stop or else `on_mousedown_external` is also triggered
    }

    /// Panning timer
    pt?: number;

    on_mousemove(e: React.MouseEvent) {
        let m = this.m;

        if(!this.state.closing && (m.mode == Mode.Panning || m.mode == Mode.Zooming)) {
            let dx = e.pageX - m.x,
                dy = e.pageY - m.y,
                t1 = performance.now(),
                dt = t1 - m.t;

            if(dt > 0) {
                // EMA
                m.vx = (m.vx + dx / dt) * 0.5;
                m.vy = (m.vy + dy / dt) * 0.5;
                m.t = t1;
            }

            clearTimeout(this.pt);

            if(m.mode == Mode.Panning) {
                // if we do not receive another mousemove event, remove velocity
                this.pt = setTimeout(() => { if(m.mode != Mode.Momentum) { m.vx = m.vy = 0; } }, 100);

                this.do_translate(dx, dy);
            } else if(m.mode == Mode.Zooming) {
                this.do_zoom(dy / -500, [m.sx, m.sy]);
            }

            e.stopPropagation(); // already handled, optimize
        }

        m.x = e.pageX;
        m.y = e.pageY;

        e.preventDefault();
    }

    on_mouseup(e: React.MouseEvent) {
        let m = this.m, panning = m.mode == Mode.Panning;

        if(!panning && m.mode != Mode.Zooming) return;

        // if there was a detectable click
        if(m.c > 0) {
            clearTimeout(this.ct);

            let dist = Math.hypot(m.x - m.sx, m.y - m.sy);

            if(dist > 10) {
                m.c = 0;
            } else if(m.c == 2) {
                panning = false;
                m.mode = Mode.Idle;
                m.c = 0;

                let z = 1, // zoom to fit by default
                    i = this.i,
                    img = this.img.current!,
                    o: [number, number] | undefined = [e.pageX, e.pageY],
                    fits_on_screen = i.z100 < 1;

                // at rendered size
                if(i.z == 1) {
                    if(fits_on_screen) {
                        z = i.zfit;
                    } else {
                        z = i.z100;
                    }
                }

                if(fits_on_screen) {
                    let cont = this.container.current!,
                        cont_width = cont.clientWidth,
                        cont_height = cont.clientHeight;

                    // compute relative proportion of image within container
                    let dw = (cont_width - img.naturalWidth) / cont_width,
                        dh = (cont_height - img.naturalHeight) / cont_height;

                    // if the image fills less than 75% of the screen, keep it to center
                    if(Math.max(dw, dh) > 0.25) {
                        o = undefined;
                    }
                }

                // force absolute z to dz
                this.do_zoom(z - i.z, o);
            }
        }

        //console.log("MOUSE UP: ", Mode[m.mode]);

        if(panning && !this.state.closing && !this.props.reduce_motion) {
            if(m.vx != 0 || m.vy != 0) {
                let dx = m.vx * 100,
                    dy = m.vy * 100;

                m.mode = Mode.Momentum;
                m.t = performance.now();

                setTimeout(() => {
                    if(m.mode == Mode.Momentum) {
                        m.mode = Mode.Idle;
                    }
                }, 500);

                this.do_translate(dx, dy);
            }
        }

        // Prevent onClick from triggering
        if(m.mode != Mode.Momentum) {
            let t0 = m.t;
            requestAnimationFrame(() => {
                // if no extra events happened
                if(m.t == t0) {
                    m.mode = Mode.Idle;
                    this.update_ui();
                }
            });
        }


        this.update_ui();

        e.preventDefault();
        e.stopPropagation();
    }

    on_wheel(e: React.WheelEvent) {
        let m = this.m;

        // TODO: Throttle
        this.do_zoom(e.deltaY / -500, [m.x, m.y]);

        e.stopPropagation();
    }

    render() {
        let { src, title, size } = this.props,
            { nat_width, nat_height, closing, zoom_level } = this.state,
            bytes = size ? format_bytes(size) : 'Unknown Size',
            meta = `${nat_width} x ${nat_height} (${bytes})`;

        return (
            <FullscreenModal>
                <div className={classNames("ln-lightbox", { closing })}
                    onClick={e => this.on_click(e)}
                    onMouseMove={e => this.on_mousemove(e)}
                    onMouseDown={e => this.on_mousedown_external(e)}
                    onMouseUp={e => this.on_mouseup(e)}
                    onWheel={e => this.on_wheel(e)}
                    onContextMenu={e => e.stopPropagation()}
                >

                    <div className="ln-lightbox__container" ref={this.container}>
                        <img src={src} ref={this.img}
                            onLoad={() => this.on_load()}
                            onClick={e => e.stopPropagation()}
                            onMouseDown={e => this.on_mousedown(e)}
                            onMouseMove={e => { /*fast path*/ this.on_mousemove(e); e.stopPropagation(); }}
                        />
                    </div>

                    <div className="ln-lightbox__footer ui-text" onClick={e => e.stopPropagation()}>
                        <span>
                            <span className="ln-lightbox-title">{title}</span>
                            <span> — {meta}</span>
                            <span className="ln-lightbox-zoom">{zoom_level}</span>
                        </span>
                    </div>
                </div>
            </FullscreenModal>
        );
    }

    animation_frame?: number;

    request_animation_update() {
        if(!this.animation_frame) {
            this.animation_frame = requestAnimationFrame(() => this.update_animation());
        }
    }

    /// current transition type
    tr: string = 'none';
    tr_frame?: number;
    pix?: number;

    update_animation() {
        this.animation_frame = undefined;

        let img = this.img.current, cont = this.container.current;
        if(!img || !cont) return;

        let { reduce_motion } = this.props,
            m = this.m, i = this.i, mode = m.mode;

        let instant = reduce_motion || [Mode.Panning, Mode.Zooming].includes(mode),
            transform = `translate(${i.x}px, ${i.y}px) scale(${i.scale})`;

        if(__DEV__) {
            if(isNaN(i.x) || isNaN(i.y) || isNaN(i.scale)) {
                alert("NaN value in LightBox::updated_animation: " + transform);
            }
        }

        if(this.tr_frame) {
            cancelAnimationFrame(this.tr_frame);
            this.tr_frame = undefined;
        }

        //if(!this.pix) { img.style['image-rendering'] = 'pixelated'; }
        //clearTimeout(this.pix);
        //this.pix = setTimeout(() => {
        //    img!.style['image-rendering'] = 'auto';
        //    img!.style['image-rendering'] = 'optimizeQuality';
        //    img!.style['image-rendering'] = 'smooth';
        //    this.pix = undefined;
        //}, 900);

        if(instant) {
            // TODO: Apply `image-rendering: pixelated` during movement
            this.tr = img.style['transition'] = 'none';
            img.style['transform'] = transform;
        } else {
            let new_transition = m.mode == Mode.Momentum ?
                // expo-ease-out
                'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)' :
                `transform 0.1s ease-out`;

            if(this.tr == new_transition) {
                img.style['transform'] = transform;
            } else {
                // stop animation
                this.tr = img.style['transition'] = 'none';

                this.tr_frame = requestAnimationFrame(() => {
                    this.tr = img!.style['transition'] = new_transition;

                    this.tr_frame = requestAnimationFrame(() => {
                        img!.style['transform'] = transform;

                        this.tr_frame = undefined;
                    });
                });
            }
        }
    }

    update_ui() {
        let img = this.img.current, cont = this.container.current;
        if(!img || !cont) return;

        let m = this.m,
            i = this.i,
            mode = m.mode,
            is_panning = mode == Mode.Panning,
            is_zooming = mode == Mode.Zooming;

        let cursor = 'auto', cont_cursor = 'auto';
        if(is_panning) {
            cursor = 'grabbing';
        } else if(m.c > 0) {
            cursor = i.z > 1 ? 'zoom-out' : 'zoom-in';
        } else if(is_zooming) {
            cursor = cont_cursor = m.vy > 0 ? 'zoom-out' : 'zoom-in';
        } else {
            cursor = 'grab';
        }

        img.style['cursor'] = cursor;
        cont.style['cursor'] = cont_cursor;
    }
}

export const LightBox = React.memo((props: ILightBoxProps) => {
    let lb = useRef<LightBoxInner>(null),
        reduce_motion = useSelector(selectPrefsFlag(UserPreferenceFlags.ReduceAnimations));

    useMainHotkeys([Hotkey.Escape, Hotkey.Plus, Hotkey.Minus], (hotkey: Hotkey, e: KeyboardEvent) => {
        let l = lb.current;
        if(l) {
            switch(hotkey) {
                case Hotkey.Escape: return l.close();
                case Hotkey.Plus: return l.do_zoom(0.25);
                case Hotkey.Minus: return l.do_zoom(-0.25);
            }
        }
    }, [lb.current]);

    return <LightBoxInner {...props} ref={lb} reduce_motion={reduce_motion} />;
});