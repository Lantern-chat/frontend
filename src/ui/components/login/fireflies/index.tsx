import React from "react";

import "./firefly.scss";

import { isPageHidden, visibilityChange } from "../../../utils";

const { sqrt, cbrt, sin, cos, random, abs, sign, PI, min, max } = Math;

interface IFireflyProps {
    count: number,
}

const FIREFLY_RADIUS: number = 16;
const FIREFLY_WIDTH: number = FIREFLY_RADIUS * 2;

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

function init_fireflies(props: IFireflyProps): IFireflyState {
    let ff: IFirefly[] = [];
    for(let i = 0; i < props.count; i++) {
        let a = random() * PI * 2.0;
        ff.push({
            offset: random(),
            size: random() * 0.7 + 0.3,
            a,
            ta: a,
            px: random() * window.innerWidth,
            py: random() * window.innerHeight,
            vx: 0, vy: 0,
        });
    }

    return { ff, paused: false, m: [1e9, 1e9, false] };
}

const MAX_SPEED = 100;
const EJECT = MAX_SPEED * 2;
const ANGLE_INTERVAL: number = 5;

function smoothstep(x: number): number {
    if(x <= 0) return 0;
    if(x >= 1) return 1;

    let x2 = x * x;
    let x3 = x2 * x;

    return 6 * x3 * x2 - 15 * x2 * x2 + 10 * x3;
}

function squine3(x0: number): number {
    let quad = (x: number) => (1 + cbrt(x * x * x - 1));
    let semi = (x: number) => (x <= 1 ? quad(x) : (2 - quad(-x + 2)));
    let full = (x: number) => (x <= 2 ? semi(x) : semi(-x + 4));

    return full(x0 % 4.0);
}

function broad_sine5(x: number): number {
    let s = sin((x - 1) * PI * 0.5);
    return 1 + cbrt(abs(s)) * sign(s);
}

function repulse(x0: number, y0: number, x1: number, y1: number, w: number): [number, number, number] {
    let dx = x0 - x1;
    let dy = y0 - y1;
    let d = sqrt(dx * dx + dy * dy);
    return [smoothstep((w - d) / w), dx, dy];
}

function gaussian2(x: number, c: number): number {
    return Math.pow(2, (x * x) / (-2 * c * c));
}

function mix(a: number, b: number, t: number): number {
    return (1 - t) * a + t * b;
}

function smin(a: number, b: number, k: number): number {
    let h = min(1, max(0, 0.5 + 0.5 * (a - b) / k));
    return mix(a, b, h) - k * h * (1.0 - h);
}

interface GradientStop {
    x: number,
    v: string,
}

// The radial gradient uses a Gaussian function for smoothness
const GRADIENT: GradientStop[] = [];
const NUM_STOPS: number = 8;
for(let i = 0; i < NUM_STOPS; i++) { // Note this is not inclusive
    let x = i / NUM_STOPS;
    GRADIENT.push({ x, v: `rgba(255, 255, 0, ${gaussian2(x, 0.25)})` });
}
GRADIENT.push({ x: 1, v: 'rgba(0, 0, 0, 0)' }); // ensure it ends in black/transparent


function render_fireflies(state: IFireflyState, canvas_ref: React.MutableRefObject<HTMLCanvasElement | null>, time: number) {
    if(!canvas_ref.current) { return; }
    let canvas = canvas_ref.current;

    let ctx = canvas.getContext("2d");
    if(!ctx) { return; }

    if(canvas.width !== window.innerWidth) {
        canvas.width = window.innerWidth;
    }
    if(canvas.height !== window.innerHeight) {
        canvas.height = window.innerHeight;
    }

    time /= 1000; // we want to work in seconds, not milliseconds

    if(!state.paused && !state.just_unpaused) {
        let dt = 0;
        if(state.time) {
            dt = time - state.time;
        }

        for(let firefly of state.ff) {
            let t = dt * ANGLE_INTERVAL;
            firefly.a = firefly.a * (1 - t) + t * firefly.ta;

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

        let gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, FIREFLY_RADIUS);

        for(let g of GRADIENT) {
            gradient.addColorStop(g.x, g.v);
        }

        //gradient.addColorStop(0, 'rgba(255, 255, 0, 0.9)');
        //gradient.addColorStop(0.2, 'rgba(255, 255, 0, 0.5)');
        //gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;

        for(let firefly of state.ff) {
            // opacity is a squine function to give a smooth "blinking" effect, with an irrational time offset
            // to avoid overlapping blinks with others
            let x = (firefly.offset * 15.61803398 + time) * 0.5;
            let u = 0.1 + 0.45 * squine3(x);
            let w = sin((x - 1) * PI / 2);
            let a = sign(w) >= 0 ? u : smin(w * 0.5 + 0.5, u, 0.2);
            ctx.globalAlpha = min(1, max(0, a));

            ctx.setTransform(firefly.size, 0, 0, firefly.size, firefly.px, firefly.py);
            ctx.fillRect(-FIREFLY_RADIUS, -FIREFLY_RADIUS, FIREFLY_WIDTH, FIREFLY_WIDTH);
        }
    }

    state.just_unpaused = false;
    state.time = time;

    state.frame = requestAnimationFrame((new_time: number) => render_fireflies(state, canvas_ref, new_time));
}

const MOUSE_EVENTS = ['mousemove', 'movedown', 'mouseup'];

// TODO: Check for reduce-motion
export const Fireflies = React.memo((props: IFireflyProps) => {
    let canvas_ref = React.useRef(null);

    React.useEffect(() => {
        let state = init_fireflies(props);
        let interval = setInterval(() => {
            if(state.paused) return;
            for(let firefly of state.ff) {
                firefly.ta += (random() * 2.0 - 1.0) * PI * 0.1;
            }
        }, 1 / ANGLE_INTERVAL);
        let mouse_listener = (e: MouseEvent) => { state.m = [e.x, e.y, e.buttons == 1]; }
        for(let e of MOUSE_EVENTS) {
            window.addEventListener(e, mouse_listener);
        }
        let hidden_listener = () => { state.paused = isPageHidden(); state.just_unpaused = !state.paused; };
        if(visibilityChange) { document.addEventListener(visibilityChange, hidden_listener); }
        state.frame = requestAnimationFrame((time: number) => render_fireflies(state, canvas_ref, time));
        return () => {
            // cancel animation first
            if(state.frame) cancelAnimationFrame(state.frame);
            clearInterval(interval);
            if(visibilityChange) document.removeEventListener(visibilityChange, hidden_listener);
            for(let e of MOUSE_EVENTS) {
                window.removeEventListener(e, mouse_listener);
            }
        }
    }, [props.count])

    return (<canvas id="ln-fireflies" ref={canvas_ref}></canvas>);
});