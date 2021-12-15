import React, { useLayoutEffect, useRef } from "react";
import { isPageHidden, visibilityChange } from "ui/utils";

export interface ICanvasRendererState {
    paused: boolean,
    frame?: number,
}

export interface ICanvasRendererProps<S extends ICanvasRendererState> {
    canvas?: React.CanvasHTMLAttributes<HTMLCanvasElement>,

    init(): S;
    render(state: S, canvas: HTMLCanvasElement | null, time_ms: number): void;
    onVisibilityChange(state: S): void;
    teardown(state: S): void;
}

export const CanvasRenderer = React.memo(function CanvasRenderer<S extends ICanvasRendererState>(props: ICanvasRendererProps<S>) {
    let canvas_ref = useRef(null);

    useLayoutEffect(() => {
        let state = props.init();

        let hidden_listener = () => {
            state.paused = isPageHidden();
            props.onVisibilityChange(state);
        };
        if(visibilityChange) { document.addEventListener(visibilityChange, hidden_listener); }

        state.frame = requestAnimationFrame((time: number) => props.render(state, canvas_ref.current, time));

        return () => {
            // cancel animation first
            if(state.frame) cancelAnimationFrame(state.frame);
            if(visibilityChange) document.removeEventListener(visibilityChange, hidden_listener);
            props.teardown(state);
        }
    }, [props.render, props.init, props.onVisibilityChange, props.teardown]);

    return (<canvas {...props.canvas} ref={canvas_ref} />);
});

if(__DEV__) {
    CanvasRenderer.displayName = "CanvasRenderer";
}