import { Ref, createRef } from "ui/hooks/createRef";
import { onCleanup, onMount } from "solid-js";

import "./fireflies.scss";

import { isPageHidden, visibilityChange } from "ui/utils";
import { smoothstep, squine3, gaussian2, smin, broad_sine2, mix } from "lib/math";
import * as color from "lib/color";
import { LIGHT_THEME, themeProgress } from "lib/theme";
import { CubicBezier } from "lib/bezier";

const { sqrt, cbrt, sin, cos, random, abs, sign, PI, min, max, floor } = Math;

const FIREFLY_RADIUS: number = 16;
const FIREFLY_WIDTH: number = FIREFLY_RADIUS * 2;

interface GradientStop {
    x: number,
    v: string,
}

function gen_gradient({ r, g, b }: color.RGBColor, stops: number): GradientStop[] {
    let gradient = [];
    for(let i = 0; i < stops; i++) { // Note this is not inclusive
        let x = i / stops;
        gradient.push({ x, v: `rgba(${r}, ${g}, ${b}, ${gaussian2(x, 0.25)})` });
    }
    gradient.push({ x: 1, v: 'rgba(0, 0, 0, 0)' }); // ensure it ends in black/transparent
    return gradient;
}

const DARK_PALETTE_HUES: number[] = [50, 60, 70];
const DARK_PALETTE: GradientStop[][] = DARK_PALETTE_HUES.map(hue => gen_gradient(color.linear2srgb(color.hsv2rgb({ h: hue, s: 1, v: 1 })), 8));

const LIGHT_PALETTE_HUES: number[] = [0, 40, 80, 120, 160, 200, 240, 280, 320];
const LIGHT_PALETTE: GradientStop[][] = LIGHT_PALETTE_HUES.map(hue => gen_gradient(color.linear2srgb(color.hsl2rgb({ h: hue, s: 0.7, l: 0.5 })), 8));

// TODO: Ease between palettes using EASE_IN and [0.5 * (D % 3 + L % 9)] merging
//function genPalette(t: number): GradientStop[][] {
//    let from, to;
//    if(LIGHT_THEME) {
//        from = DARK_PALETTE;
//        to = LIGHT_PALETTE;
//    } else {
//        from = LIGHT_PALETTE;
//        to = DARK_PALETTE;
//    }
//    if(t <= 0) return from;
//    if(t >= 1) return to;
//}

interface IFireflyProps {
    density?: number,
}

interface IFirefly {
    offset: number,
    size: number,
    // Current angle trajectory
    a: number,
    // Target angle
    ta: number,
    px: number,
    py: number,
    vx: number,
    vy: number,
}

interface IFireflyState {
    density: number,
    // If we just unpaused, run a single frame without changes to update the time delta
    just_unpaused?: boolean,
    paused: boolean,
    frame?: number,
    time?: number,
    // Array of fireflies
    ff: IFirefly[],
    // mouse position
    m: [number, number, boolean],
}

const MAX_SPEED = 60;
const EJECT = MAX_SPEED * 2;
const ANGLE_INTERVAL: number = 1;
const EASE_IN: CubicBezier = new CubicBezier(0.42, 0, 1, 1);
const EASE_OUT: CubicBezier = new CubicBezier(0, 0, 0.58, 1);

function gen_firefly(min_x: number, max_x: number, min_y: number, max_y: number): IFirefly {
    let a = random() * PI * 2.0;

    return {
        offset: random(),
        size: random() * 0.7 + 0.3,
        a,
        ta: a,
        px: min_x + random() * (max_x - min_x),
        py: min_y + random() * (max_y - min_y),
        vx: 0, vy: 0,
    };
}

function repulse(x0: number, y0: number, x1: number, y1: number, w: number): [number, number, number] {
    let dx = x0 - x1;
    let dy = y0 - y1;
    let d = sqrt(dx * dx + dy * dy);
    return [smoothstep((w - d) / w), dx, dy];
}

function desiredCount(w: number, h: number, density: number): number {
    return (w * h) / (density * density);
}

function render_fireflies(state: IFireflyState, canvas_ref: Ref<HTMLCanvasElement | undefined>, time_ms: number) {
    if(!canvas_ref.current) { return; }
    let canvas = canvas_ref.current;

    let ctx = canvas.getContext("2d");
    if(!ctx) { return; }

    let previous_canvas_size = { w: canvas.width, h: canvas.height };

    let size_changed = 0;
    if(canvas.width !== window.innerWidth) {
        size_changed |= canvas.width = window.innerWidth;
    }
    if(canvas.height !== window.innerHeight) {
        size_changed |= canvas.height = window.innerHeight;
    }

    let cnt = desiredCount(canvas.width, canvas.height, state.density);

    if(size_changed) {
        let { w, h } = previous_canvas_size;

        let dx = canvas.width - w;
        let dy = canvas.height - h;

        let dead: number[] = [];
        for(let idx = 0; idx < state.ff.length; idx++) {
            let ff = state.ff[idx];

            ff.px += dx * 0.5;
            ff.py += dy * 0.5;

            if(ff.px < 0 || ff.px > canvas.width || ff.py < 0 || ff.py > canvas.height) {
                dead.push(idx);
            }
        }

        for(let idx = dead.length; idx--;) {
            state.ff.splice(dead[idx], 1);
        }
    }

    while(state.ff.length < cnt) {
        state.ff.push(gen_firefly(0, canvas.width, 0, canvas.height));
    }

    let time = time_ms / 1000; // we want to work in seconds, not milliseconds

    if(!state.paused && !state.just_unpaused) {
        let dt = 0,
            progress = EASE_IN.y(themeProgress(time_ms)),
            scale = LIGHT_THEME ? (1 + progress) : (2 - progress);

        if(state.time) {
            dt = time - state.time;
        }

        for(let firefly of state.ff) {
            let t = dt * ANGLE_INTERVAL;
            firefly.a = mix(firefly.a, firefly.ta, t);

            // adjust velocity
            let v = dt * MAX_SPEED;
            firefly.vx += sin(firefly.a) * v;
            firefly.vy += cos(firefly.a) * v;

            // for every 0.4% of particles, apply some repulsion effects
            if(random() < 0.004) {
                for(let other of state.ff) {
                    let [r, dx, dy] = repulse(firefly.px, firefly.py, other.px, other.py, 40);

                    // computes a tiny parabola where the repulsive effect is propertional
                    // to difference in sizes, with max repulsion at equal sizes
                    let ds = 2 * abs(firefly.size - other.size);
                    r *= r * max(0, 1 - ds * ds) * dt * 666 * random();

                    // 20% of the time, attract them instead for a bit of unpredictability
                    if(random() < 0.2) {
                        r *= -1;
                    }

                    firefly.vx += dx * r;
                    firefly.vy += dy * r;
                }
            }

            // TODO: Determine if click-attract is appealing
            state.m[2] = false;

            // Repel from mouse cursor
            let [r, dx, dy] = repulse(firefly.px, firefly.py, state.m[0], state.m[1], 30 * firefly.size * (state.m[2] ? 10 : 1));
            r *= r * dt * 1000 * (state.m[2] ? -1 : 1); // ^2 falloff + time domain
            // accelerate away in the current direction a tiny bit
            firefly.vx *= r * 0.1 + 1;
            firefly.vy *= r * 0.1 + 1;
            // repel away from the mouse
            firefly.vx += dx * r * 0.9;
            firefly.vy += dy * r * 0.9;


            // dampening
            firefly.vx = min(EJECT, max(-EJECT, firefly.vx * 0.99));
            firefly.vy = min(EJECT, max(-EJECT, firefly.vy * 0.99));

            // apply velocity to position
            firefly.px += dt * firefly.vx;
            firefly.py += dt * firefly.vy;

            // clamp position
            firefly.px = min(max(0, firefly.px), canvas.width);
            firefly.py = min(max(0, firefly.py), canvas.height);

            // if at border, apply repulsive force
            if(firefly.px === 0) { firefly.vx += EJECT; }
            else if(firefly.px === canvas.width) { firefly.vx -= EJECT; }
            if(firefly.py === 0) { firefly.vy += EJECT; }
            else if(firefly.py === canvas.height) { firefly.vy -= EJECT; }
        }
        ctx.resetTransform();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let palette: CanvasGradient[] = (LIGHT_THEME ? LIGHT_PALETTE : DARK_PALETTE).map((p) => {
            let gradient = ctx!.createRadialGradient(0, 0, 0, 0, 0, FIREFLY_RADIUS);
            for(let g of p) { gradient.addColorStop(g.x, g.v); }
            return gradient;
        });

        //gradient.addColorStop(0, 'rgba(255, 255, 0, 0.9)');
        //gradient.addColorStop(0.2, 'rgba(255, 255, 0, 0.5)');
        //gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        let dying: number[] = [];
        let len = state.ff.length;
        for(let idx = 0; idx < len; idx++) {
            let firefly = state.ff[idx];
            // opacity is a squine function to give a smooth "blinking" effect, with an irrational time offset
            // to avoid overlapping blinks with others
            let x = (firefly.offset * 15.61803398 + time) * 0.5;
            //let u = 0.1 + 0.45 * squine3(x);
            //let w = sin((x - 1) * PI / 2);
            //let a = sign(w) >= 0 ? u : smin(w * 0.5 + 0.5, u, 0.35);
            //ctx.globalAlpha = min(1, max(0, a));
            let a: number;
            if(firefly.offset < 0.5) {
                a = broad_sine2(x) * 0.5;
            } else {
                a = sin(PI * 0.6 * x);
                a *= a;
            }

            if(random() < 0.01 && a < 0.01 && cnt < (len - dying.length - 1)) {
                dying.push(idx);
            }

            ctx.globalAlpha = a;

            ctx.fillStyle = palette[floor(firefly.offset * palette.length)];

            let size = firefly.size * scale;

            ctx.setTransform(size, 0, 0, size, firefly.px, firefly.py);
            ctx.fillRect(-FIREFLY_RADIUS, -FIREFLY_RADIUS, FIREFLY_WIDTH, FIREFLY_WIDTH);
        }

        for(let idx = dying.length; idx--;) {
            state.ff.splice(dying[idx], 1);
        }
    }

    state.just_unpaused = false;
    state.time = time;

    state.frame = requestAnimationFrame((new_time: number) => render_fireflies(state, canvas_ref, new_time));
}

const MOUSE_EVENTS = ['mousemove', 'movedown', 'mouseup'];

// TODO: Check for reduce-motion
export function Fireflies(props: IFireflyProps) {
    let canvas_ref = createRef<HTMLCanvasElement>();

    onMount(() => {
        let state: IFireflyState = { ff: [], paused: false, m: [1e9, 1e9, false], density: props.density || 175 },
            interval = setInterval(() => {
                if(!state.paused) {
                    for(let firefly of state.ff) {
                        firefly.ta += (random() * 2.0 - 1.0) * PI * 0.1;
                    }
                }
            }, 1 / ANGLE_INTERVAL);

        let mouse_listener = (e: MouseEvent) => { state.m = [e.x, e.y, e.buttons == 1]; }
        for(let e of MOUSE_EVENTS) {
            window.addEventListener(e, mouse_listener);
        }

        let hidden_listener = () => {
            state.paused = isPageHidden(); state.just_unpaused = !state.paused;

            __DEV__ && console.log("FIREFLIES PAUSED? ", state.paused);
        };
        if(visibilityChange) { document.addEventListener(visibilityChange, hidden_listener); }


        state.frame = requestAnimationFrame((time: number) => render_fireflies(state, canvas_ref, time));

        onCleanup(() => {
            // cancel animation first
            if(state.frame) cancelAnimationFrame(state.frame);
            clearInterval(interval);
            if(visibilityChange) document.removeEventListener(visibilityChange, hidden_listener);
            for(let e of MOUSE_EVENTS) {
                window.removeEventListener(e, mouse_listener);
            }
        });
    });

    return (<canvas id="ln-fireflies" ref={canvas_ref} />);
}