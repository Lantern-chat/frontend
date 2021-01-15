import React from "react";

import "./firefly.scss";

import { isPageHidden, visibilityChange } from "../../../utils";

const { sqrt, cbrt, sin, cos, random, abs, sign, PI, min, max } = Math;

interface IFireflyProps {
    count: number,
}

interface IFirefly {
    offset: number,
    size: number,
    // Current angle trajectory
    a: number,
    // Target angle
    ta: number,
    pos: [number, number],
    vel: [number, number],
}

interface IFireflyState {
    // If we just unpaused, run a single frame without changes to update the time delta
    just_unpaused?: boolean,
    paused: boolean,
    frame?: number,
    time?: number,
    // Array of fireflies
    ff: IFirefly[],
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
            pos: [random() * window.innerWidth, random() * window.innerHeight],
            vel: [0, 0],
        });
    }

    return { ff, paused: false };
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
    let quad = (x: number) => (1 + cbrt(-1 + x * x * x));
    let semi = (x: number) => (x <= 1 ? quad(x) : (2 - quad(-x + 2)));
    let full = (x: number) => (x <= 2 ? semi(x) : semi(-x + 4));

    return full(x0 % 4.0);
}

function broad_sine5(x: number): number {
    let s = sin((x - 1) * PI * 0.5);
    return 1 + cbrt(abs(s)) * sign(s);
}

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

    time /= 1000;

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
            firefly.vel[0] += sin(firefly.a) * v;
            firefly.vel[1] += cos(firefly.a) * v;

            if(random() < 0.004) {
                for(let other of state.ff) {
                    let dx = firefly.pos[0] - other.pos[0];
                    let dy = firefly.pos[1] - other.pos[1];
                    let d = sqrt(dx * dx + dy * dy);

                    // Smoothstep falloff
                    let repulse = smoothstep((100 - d) / 100);

                    // computes a tiny parabola where the repulsive effect is propertional
                    // to difference in sizes, with max repulsion at equal sizes
                    let ds = 2 * abs(firefly.size - other.size);
                    repulse *= repulse * max(0, 1 - ds * ds) * dt * 666 * random();

                    if(random() < 0.2) {
                        repulse *= -1;
                    }

                    firefly.vel[0] += dx * repulse;
                    firefly.vel[1] += dy * repulse;
                }
            }

            // dampening
            firefly.vel[0] = min(EJECT, max(-EJECT, firefly.vel[0] * 0.99));
            firefly.vel[1] = min(EJECT, max(-EJECT, firefly.vel[1] * 0.99));

            // apply velocity to position
            firefly.pos[0] += dt * firefly.vel[0];
            firefly.pos[1] += dt * firefly.vel[1];

            // clamp position
            firefly.pos[0] = min(max(0, firefly.pos[0]), canvas.width);
            firefly.pos[1] = min(max(0, firefly.pos[1]), canvas.height);

            // if at border, apply repulsive force
            if(firefly.pos[0] === 0) { firefly.vel[0] += EJECT; }
            else if(firefly.pos[0] === canvas.width) { firefly.vel[0] -= EJECT; }
            if(firefly.pos[1] === 0) { firefly.vel[1] += EJECT; }
            else if(firefly.pos[1] === canvas.height) { firefly.vel[1] -= EJECT; }
        }
        ctx.resetTransform();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 12);

        gradient.addColorStop(0, 'rgba(255, 255, 0, 0.9)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 0, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;

        for(let firefly of state.ff) {
            ctx.globalAlpha = min(1, 0.1 + 0.45 * squine3((firefly.offset * 15.61803398 + time) * 0.5));

            ctx.setTransform(firefly.size, 0, 0, firefly.size, firefly.pos[0], firefly.pos[1]);
            ctx.fillRect(-12, -12, 24, 24);
        }
    }

    state.just_unpaused = false;
    state.time = time;

    state.frame = requestAnimationFrame((new_time: number) => render_fireflies(state, canvas_ref, new_time));
}

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
        let listener = () => { state.paused = isPageHidden(); state.just_unpaused = !state.paused; };
        if(visibilityChange) { document.addEventListener(visibilityChange, listener); }
        state.frame = requestAnimationFrame((time: number) => render_fireflies(state, canvas_ref, time));
        return () => {
            clearInterval(interval);
            if(state.frame) cancelAnimationFrame(state.frame);
            if(visibilityChange) document.removeEventListener(visibilityChange, listener);
        }
    }, [props.count])

    return (<canvas id="ln-fireflies" ref={canvas_ref}></canvas>);
});