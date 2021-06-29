import React, { useLayoutEffect, useEffect, useRef } from "react";

import { useResizeDetector } from 'react-resize-detector';
//import { useResizeDetector as useResizeDetectorPolyfill } from "react-resize-detector/build/withPolyfill";

export interface ITimelineProps {
    position: number,
    direction: -1 | 0 | 1,
}

function render_timeline(props: ITimelineProps, { width = 0, height = 0 }: { width?: number, height?: number }, canvas_ref: React.MutableRefObject<HTMLCanvasElement | null>) {
    if(!canvas_ref.current) { return; }
    let canvas = canvas_ref.current;

    let ctx = canvas.getContext("2d");
    if(!ctx) { return; }

    if(canvas.width != width) {
        canvas.width = width;
    }
    if(canvas.height != height) {
        canvas.height = height;
    }

    //ctx.fillStyle = "rgb(255, 0, 0)";
    //ctx.fillRect(0, 0, width, height);

    let lines = 60;

    ctx.fillStyle = "rgb(255, 255, 255)";
    let y = 0;
    for(let i = 0; i < lines; i++) {
        let length = 0.8;
        switch(i % 4) {
            case 0: { length = 0.2; break; }
            case 2: { length = 0.4; break; }
            case 1: { length = 0.6; break; }
        }

        let w = length * width;

        ctx.fillRect(width - w, y, w, 2);

        y += height / 60;
    }
}

export const Timeline = React.memo((props: ITimelineProps) => {
    const { width, height, ref } = useResizeDetector();

    let canvas_ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        requestAnimationFrame(() => render_timeline(props, { width, height }, canvas_ref));
    }, [props, width, height, canvas_ref]);

    return (
        <div className="ln-msg-list__timeline" ref={ref as any}>
            <canvas ref={canvas_ref} />
        </div>
    );
});

/*

import React, { useLayoutEffect, useEffect, useRef } from "react";

import ReactResizeDetectorNative from 'react-resize-detector';

const ReactResizeDetectorPolyfill = React.lazy(() => import('react-resize-detector/build/withPolyfill'));

const ReactResizeDetector = window.ResizeObserver ? ReactResizeDetectorNative : ReactResizeDetectorPolyfill;

import { useResizeDetector } from 'react-resize-detector';
//import { useResizeDetector as useResizeDetectorPolyfill } from "react-resize-detector/build/withPolyfill";

export interface ITimelineProps {
    position: number,
    direction: -1 | 0 | 1,
}

function render_timeline({ position, direction, width = 0, height = 0 }: ITimelineInnerProps, canvas_ref: React.MutableRefObject<HTMLCanvasElement | null>) {
    if(!canvas_ref.current) { return; }
    let canvas = canvas_ref.current;

    let ctx = canvas.getContext("2d");
    if(!ctx) { return; }

    if(canvas.width != width) {
        canvas.width = width;
    }
    if(canvas.height != height) {
        canvas.height = height;
    }

    //ctx.fillStyle = "rgb(255, 0, 0)";
    //ctx.fillRect(0, 0, width, height);

    let lines = 60;

    ctx.fillStyle = "rgb(255, 255, 255)";
    let y = 0;
    for(let i = 0; i < lines; i++) {
        let length = 0.8;
        switch(i % 4) {
            case 0: { length = 0.2; break; }
            case 2: { length = 0.4; break; }
            case 1: { length = 0.6; break; }
        }

        let w = length * width;

        ctx.fillRect(width - w, y, w, 2);

        y += height / 60;
    }
}

interface ITimelineInnerProps extends ITimelineProps {
    width?: number,
    height?: number,
}

const TimelineInner = React.memo((props: ITimelineInnerProps) => {
    let canvas_ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        requestAnimationFrame(() => render_timeline(props, canvas_ref));
    }, [props, canvas_ref]);

    return (
        <div className="ln-msg-list__timeline">
            <canvas ref={canvas_ref} />
        </div>
    );
});

export const Timeline = React.memo((props: ITimelineProps) => (
    <ReactResizeDetector handleWidth handleHeight>
        {({ width, height }) => <TimelineInner {...props} width={width} height={height} />}
    </ReactResizeDetector>
));
*/