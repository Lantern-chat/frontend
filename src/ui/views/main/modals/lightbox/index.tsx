import classNames from "classnames";
import React, { createRef, useLayoutEffect, useRef } from "react";
import { useSelector } from "react-redux";

import { format_bytes } from "lib/formatting";

import { UserPreferenceFlags } from "state/models";
import { selectPrefsFlag } from "state/selectors/prefs";

import { FullscreenModal } from "ui/components/modal";
import { Hotkey, useMainHotkeys } from "ui/hooks/useMainClick";

enum Mode {
    Idle = 0,
    Momentum = 1,
    Panning = 2,
    Zooming = 3,
}

/// State that requires re-rendering when updated
interface ILightBoxState {
    closing: boolean,
    loaded: boolean,

    nh: number,
    nw: number,

    // cached zoom percentage string
    zoom_level: string,
}

interface IPointerState {
    /// Time of last pointer event
    t: number,

    /// Current pointer position (as of last event)
    x: number, y: number,

    /// Pointer starting position (when clicked or pressed before drag)
    sx: number, sy: number,

    /// Pointer velocity (delta distance over delta time between events)
    vx: number, vy: number,

    /// Number of active current clicks/taps
    c: number,

    /// Activity mode, what is currently being done
    mode: Mode,
}

interface IImageState {
    nw: number, nh: number,

    /// Image translation, excluding bounds checking
    x: number, y: number,

    /// Real image translation
    rx: number, ry: number,

    /// Zoom and scale value
    z: number, scale: number,

    zmin: number, zmax: number,
    zfit: number, z100: number,
}

interface IZAnimationState {

}

interface IAnimationState {
    /// Current coordinates
    x: number, y: number,
    /// Target coordinates
    tx: number, ty: number,

    /// Current and target z value
    z: number, tz: number,

    /// Translation and Z estimated completion time
    ta: number, za: number,

    /// Animation update time
    t: number,

    /// Next animation frame
    f?: number,

    /// Animation is occuring
    e: boolean,
}

interface ICanvasState {
    /// Usable width and height (real full-screen height minus footer)
    uh: number, uw: number,

    o?: { w: number, h: number, x: number, y: number },
}

export interface ILightBoxProps {
    src: string,
    title?: string,
    size?: number,
    reduce_motion?: boolean,

    onClose(): void;
    startClose(): void;
}

const LN5_00 = Math.log(5.00);
const LN0_05 = Math.log(0.05);

import "./lightbox.scss";
export class LightBoxInner extends React.Component<ILightBoxProps, ILightBoxState> {
    constructor(props: ILightBoxProps) {
        super(props);

        this.state = {
            closing: false,
            loaded: false,
            nw: 0, nh: 0,
            zoom_level: '%'
        };

        if(__DEV__) {
            window['lightbox'] = this;
        }
    }

    img: React.RefObject<HTMLImageElement> = createRef();
    lightbox: React.RefObject<HTMLDivElement> = createRef();
    canvas: React.RefObject<HTMLCanvasElement> = createRef();
    footer: React.RefObject<HTMLDivElement> = createRef();

    on_resize2 = this.on_resize.bind(this);
    componentDidMount() { window.addEventListener('resize', this.on_resize2); }
    componentWillUnmount() { window.removeEventListener('resize', this.on_resize2); }

    close() {
        let { reduce_motion, onClose } = this.props;

        if(reduce_motion) return onClose();

        this.props.startClose();
        this.setState({ closing: true });
        setTimeout(() => onClose(), 150);
    }

    render() {
        let { src, title, size } = this.props,
            { nw, nh, closing, loaded, zoom_level } = this.state,
            bytes = size ? format_bytes(size) : 'Unknown Size',
            meta = `${nw} x ${nh} (${bytes})`,
            eat = (e: React.SyntheticEvent) => e.stopPropagation();

        return (
            <FullscreenModal>
                <div className={classNames("ln-lightbox", { closing, opening: !loaded })} ref={this.lightbox}>
                    <canvas ref={this.canvas} />

                    <div className="ln-lightbox__img" style={{ display: loaded ? 'none' : undefined }}>
                        <img src={src} ref={this.img} onLoad={() => this.on_load()} />
                    </div>

                    <div className="ln-lightbox__footer ui-text" ref={this.footer} style={{ position: loaded ? 'absolute' : 'relative' }}>
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

    p: IPointerState = {
        t: 0,

        x: 0, y: 0,

        sx: 0, sy: 0,

        vx: 0, vy: 0,

        mode: Mode.Idle,

        c: 0,
    };

    i: IImageState = {
        nw: 0, nh: 0,
        x: 0, y: 0,
        rx: 0, ry: 0,
        z: 1, scale: 1,
        zmin: -1.5, zmax: 3.5,
        z100: 1, zfit: 1,
    };

    c: ICanvasState = {
        uh: 0, uw: 0,
    };

    a: IAnimationState = {
        x: 0, y: 0,
        tx: 0, ty: 0,
        z: 1, tz: 1,
        ta: 0, za: 0,
        t: 0, e: false,
    };

    on_load() {
        let img = this.img.current!, i = this.i;

        i.nw = img.naturalWidth;
        i.nh = img.naturalHeight;

        this.setState({ loaded: true, nh: i.nh, nw: i.nw });

        this.on_resize();

        i.scale = Math.exp(Math.min(i.zfit, i.z100) - 1);

        this.recompute_zoom_level();
        this.draw();
    }

    on_resize() {
        let lb = this.lightbox.current!,
            footer = this.footer.current!,
            canvas = this.canvas.current!,
            ch = canvas.height = lb.clientHeight,
            cw = canvas.width = lb.clientWidth;

        // NOTE: Resets `o` to undefined
        this.c = { uh: ch - footer.clientHeight, uw: cw };

        this.recompute_zoom_bounds();

        if(this.state.loaded) {
            this.draw();
        }
    }

    recompute_zoom_bounds() {
        let i = this.i,
            { nw, nh } = i, // natural image dimensions
            { uw, uh } = this.c; // usable width/height (so excluding footer)

        i.z100 = Math.log(Math.max(nw / uw, nh / uh)) + 1;
        i.zfit = Math.log(Math.min(uw / nw, uh / nh)) + 1;
        i.zmin = Math.max(i.z100, i.zfit) + LN0_05; // 5% of 100% or fit
        i.zmax = Math.max(i.z100 + LN5_00, i.zfit); // 500% or fit

        //this.do_zoom(0); // apply any bounds checking (both of z and borders)
    }

    recompute_zoom_level() {
        this.setState({ zoom_level: Math.round(this.i.scale * 100).toLocaleString('en-US') + '%' });
    }

    animate() {

    }

    draw() {
        let img = this.img.current!,
            canvas = this.canvas.current!,
            { i, c, a } = this, o = c.o,
            ctx = canvas.getContext('2d');

        if(!ctx) return;

        if(o) {
            let overdraw = i.scale * 2, o2 = overdraw * 2;
            ctx.clearRect(
                o.x - overdraw,
                o.y - overdraw,
                o.w + o2,
                o.h + o2
            );
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        // disable image smoothing if animating
        ctx.imageSmoothingEnabled = !a.e;
        ctx.imageSmoothingQuality = 'high';


        let w = i.scale * i.nw,
            h = i.scale * i.nh,
            x = (c.uw - w) * 0.5 + i.rx,
            y = (c.uh - h) * 0.5 + i.ry;

        // unoptimized version of above
        //x = i.rx - w * 0.5 + c.uw * 0.5,
        //y = i.ry - h * 0.5 + c.uh * 0.5;

        ctx.drawImage(img, x, y, w, h);
        c.o = { x, y, w, h };
    }
}

export const LightBox = React.memo((props: Omit<ILightBoxProps, 'startClose'>) => {
    let lb = useRef<LightBoxInner>(null),
        reduce_motion = useSelector(selectPrefsFlag(UserPreferenceFlags.ReduceAnimations)),
        de = document.documentElement;

    useMainHotkeys([Hotkey.Escape, Hotkey.Plus, Hotkey.Minus], (hotkey: Hotkey, e: KeyboardEvent) => {
        let l = lb.current;
        if(l) {
            switch(hotkey) {
                case Hotkey.Escape: return l.close();
                //case Hotkey.Plus: return l.do_zoom(0.25);
                //case Hotkey.Minus: return l.do_zoom(-0.25);
            }
        }
    }, [lb.current]);

    useLayoutEffect(() => {
        if(!reduce_motion) {
            de.classList.add("ln-lightbox-open");
        }

        return () => {
            de.classList.remove("ln-lightbox-open");
            de.classList.remove("ln-lightbox-closing");
        };
    }, [reduce_motion]);

    let startClose = () => {
        if(!reduce_motion) {
            de.classList.add("ln-lightbox-closing");
        }
    };

    return <LightBoxInner {...props} ref={lb} reduce_motion={reduce_motion} startClose={startClose} />;
});