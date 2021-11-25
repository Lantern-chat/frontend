import classNames from "classnames";
import { format_bytes } from "lib/formatting";

import React, { createRef, useRef } from "react";


import { FullscreenModal } from "ui/components/modal";
import { useMainHotkey, Hotkey, useMainHotkeys } from "ui/hooks/useMainClick";

/// State that requires re-rendering when updated
interface ILightBoxState {
    closing: boolean,
    nat_width: number,
    nat_height: number,
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
}

interface IImageState {
    /// Image translation
    x: number, y: number,

    /// Zoom and scale value
    z: number, scale: number,
}

export interface ILightBoxProps {
    src: string,
    title?: string,
    size?: number,
    reduce_motion?: boolean,

    onClose(): void;
}

import "../lightbox/lightbox.scss";
export class LightBoxInner extends React.Component<ILightBoxProps, ILightBoxState> {
    constructor(props: ILightBoxProps) {
        super(props);

        this.state = {
            closing: false,
            nat_height: 0,
            nat_width: 0,
        };
    }

    img: React.RefObject<HTMLImageElement> = createRef();
    container: React.RefObject<HTMLDivElement> = createRef();

    m: IMouseState = {
        t: 0,

        x: 0, y: 0,

        sx: 0, sy: 0,

        vx: 0, vy: 0,

        mode: Mode.Idle,
    };

    i: IImageState = {
        x: 0, y: 0,
        z: 1, scale: 1,
    };


    close() {
        let { reduce_motion, onClose } = this.props;

        if(reduce_motion) return onClose();

        this.setState({ closing: true });
        setTimeout(() => onClose(), 150);
    }

    do_translate(dx: number, dy: number) {
        if(dx == dy && dy == 0) return;

        let state = this.i;

        state.x += dx;
        state.y += dy;

        this.request_update();
    }

    do_zoom(dz: number, at?: [number, number]) {
        let state = this.i,
            // new Z
            z = Math.max(-1.5, Math.min(3, state.z + dz));

        if(state.z == z) return; // at limit most likely

        if(at) {
            let i = this.img.current!,
                rect = i.getBoundingClientRect(),
                [x, y] = at,
                is_inside = (rect.left < x && x < rect.right) && (rect.top < y && y < rect.bottom);

            // apply relative zoom if and only if the anchor is inside the image on-screen
            if(is_inside) {
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

        this.request_update();
    }

    on_load() {
        let i = this.img.current;
        if(i) {
            this.setState((prev) => ({
                ...prev,
                nat_width: i!.naturalWidth,
                nat_height: i!.naturalHeight
            }));
        }
    }

    on_click(e: React.MouseEvent) {
        e.stopPropagation();

        let mode = this.m.mode;

        // if not panning or zooming, allow close
        if(mode != Mode.Panning && mode != Mode.Zooming) {
            this.close();
        }
    }

    render() {
        let { src, title, size } = this.props,
            { nat_width, nat_height, closing } = this.state,
            { scale } = this.i,
            bytes = size ? format_bytes(size) : 'Unknown Size',
            meta = `${nat_width} x ${nat_height} (${bytes})`,
            zoom_level;

        let img = this.img.current;
        if(img) {
            zoom_level = Math.round(img.clientWidth * scale / nat_width * 100).toLocaleString('en-US') + '%';
        }

        return (
            <FullscreenModal>
                <div className={classNames("ln-lightbox", { closing })}>
                    <div className="ln-lightbox__container" ref={this.container} onClick={e => this.on_click(e)}>

                        <img src={src} ref={this.img}
                            onLoad={() => this.on_load()}
                            onClick={e => e.stopPropagation()}
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

        //return (
        //    <FullscreenModal>
        //        <div className={classNames("ln-lightbox", { closing: this.state.closing })}
        //            onClick={on_click_background} onContextMenu={eat}
        //            onMouseMove={on_mousemove} onMouseDown={on_mousedown_external} onMouseUp={on_mouseup} onWheel={on_wheel}
        //        >
        //            <div className="ln-lightbox__container" ref={container_ref} style={{ cursor: cont_cursor }}>
        //                <img src={src} ref={this.img}
        //                    onLoad={on_load}
        //                    onClick={on_click_image}
        //                    onMouseDown={on_mousedown}
        //                />
        //            </div>
        //
        //            <div className="ln-lightbox__footer ui-text" onClick={on_click_image}>
        //                <span>
        //                    <span className="ln-lightbox-title">{title}</span>
        //                    <span> — {meta}</span>
        //                    <span className="ln-lightbox-zoom">{zoom_level}</span>
        //                </span>
        //            </div>
        //        </div>
        //    </FullscreenModal>
        //);
    }

    f?: number;

    request_update() {
        if(!this.f) {
            this.f = requestAnimationFrame(() => this.update());
        }
    }

    update() {
        this.f = undefined;

        let img = this.img.current;
        if(!img) return;

        let { reduce_motion } = this.props, mode = this.m.mode, i = this.i;

        let instant = reduce_motion || mode == Mode.Panning || mode == Mode.Zooming,
            transform = `translate(${i.x}px, ${i.y}px) scale(${i.scale})`;

        img.style['transform'] = transform;

        // TODO: Update CSS animations
    }
}

export const LightBox = React.memo((props: ILightBoxProps) => {
    let lb = useRef<LightBoxInner>(null);

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

    return <LightBoxInner {...props} ref={lb} />;
});