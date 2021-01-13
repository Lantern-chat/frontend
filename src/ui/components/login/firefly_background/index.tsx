import React from "react";

import "./firefly.scss";

interface IFireflyProps {
    count: number,
}

interface IFirefly {
    offset: number,
    size: number,
    angle: number,
    target_angle: number,
    pos: [number, number],
    vel: [number, number],
}

interface IFireflyState {
    frame?: number,
    time?: number,
    fireflies: IFirefly[],
}

function init_fireflies(props: IFireflyProps): IFireflyState {
    let fireflies: IFirefly[] = [];
    for(let i = 0; i < props.count; i++) {
        let angle = Math.random() * Math.PI * 2.0;
        fireflies.push({
            offset: Math.random(),
            size: Math.random(),
            angle,
            target_angle: angle,
            pos: [Math.random() * window.innerWidth, Math.random() * window.innerHeight],
            vel: [0, 0],
        });
    }

    return { fireflies };
}

const MAX_SPEED = 100;
const EJECT = MAX_SPEED * 1.2;
const ANGLE_INTERVAL: number = 5;

function render_fireflies(state: IFireflyState, canvas_ref: React.MutableRefObject<HTMLCanvasElement | null>, time: number) {
    if(!canvas_ref.current) { return; }
    let canvas = canvas_ref.current;

    if(canvas.width !== window.innerWidth) {
        canvas.width = window.innerWidth;
    }
    if(canvas.height !== window.innerHeight) {
        canvas.height = window.innerHeight;
    }

    let ctx = canvas.getContext("2d");
    if(!ctx) { return; }

    time /= 1000;

    let dt = 0;
    if(state.time) {
        dt = time - state.time;
    }

    for(let firefly of state.fireflies) {
        let t = dt * ANGLE_INTERVAL;
        firefly.angle = firefly.angle * (1 - t) + t * firefly.target_angle;

        // adjust velocity
        let v = dt * MAX_SPEED;
        firefly.vel[0] += Math.sin(firefly.angle) * v;
        firefly.vel[1] += Math.cos(firefly.angle) * v;

        // dampening
        firefly.vel[0] = Math.min(MAX_SPEED, Math.max(-MAX_SPEED, firefly.vel[0] * 0.99));
        firefly.vel[1] = Math.min(MAX_SPEED, Math.max(-MAX_SPEED, firefly.vel[1] * 0.99));

        // apply velocity to position
        firefly.pos[0] += dt * firefly.vel[0];
        firefly.pos[1] += dt * firefly.vel[1];

        // clamp position
        firefly.pos[0] = Math.min(Math.max(0, firefly.pos[0]), canvas.width);
        firefly.pos[1] = Math.min(Math.max(0, firefly.pos[1]), canvas.height);

        // if at border, apply repulsive force
        if(firefly.pos[0] === 0) { firefly.vel[0] += EJECT; }
        else if(firefly.pos[0] === canvas.width) { firefly.vel[0] -= EJECT; }
        if(firefly.pos[1] === 0) { firefly.vel[1] += EJECT; }
        else if(firefly.pos[1] === canvas.height) { firefly.vel[1] -= EJECT; }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for(let firefly of state.fireflies) {
        let gradient = ctx.createRadialGradient(firefly.pos[0], firefly.pos[1], 0, firefly.pos[0], firefly.pos[1], 12);

        gradient.addColorStop(0, 'rgba(255, 255, 0, 0.9)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 0, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        let s = Math.sin((firefly.offset * 3 + time) * Math.PI * 0.5);
        let s2 = s * s;
        ctx.globalAlpha = s2 * 0.7 + 0.3;

        ctx.fillStyle = gradient;
        ctx.fillRect(firefly.pos[0] - 12, firefly.pos[1] - 12, 24, 24);
    }

    state.time = time;

    state.frame = requestAnimationFrame((new_time: number) => render_fireflies(state, canvas_ref, new_time));
}

export const Fireflies = React.memo((props: IFireflyProps) => {
    let canvas_ref = React.useRef(null);

    React.useEffect(() => {
        console.log("HERE");
        let state = init_fireflies(props);
        let interval = setInterval(() => {
            for(let firefly of state.fireflies) {
                firefly.target_angle += (Math.random() * 2.0 - 1.0) * Math.PI * 0.1;
            }
        }, 1 / ANGLE_INTERVAL);
        state.frame = requestAnimationFrame((time: number) => render_fireflies(state, canvas_ref, time));
        return () => { clearInterval(interval); if(state.frame) cancelAnimationFrame(state.frame); }
    }, [props.count])

    return (<canvas id="ln-fireflies" ref={canvas_ref}></canvas>);
});