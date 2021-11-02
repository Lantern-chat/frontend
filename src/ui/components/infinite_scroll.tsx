import React, { useContext, useRef, useMemo, useState, useEffect, useCallback, useReducer, useLayoutEffect } from "react";
import { useResizeDetector } from "react-resize-detector/build/withPolyfill";

import once from "lodash/once";

export enum Anchor {
    Top,
    Scrolling,
    Bottom,
}

function compute_at(e: HTMLElement, top_threshold: number, bottom_threshold: number): Anchor {
    let scroll_height = e.scrollHeight - e.offsetHeight,
        scroll_top = e.scrollTop;

    if((scroll_height - scroll_top) < bottom_threshold) {
        return Anchor.Bottom;
    } else if(scroll_top < top_threshold) {
        return Anchor.Top;
    } else {
        return Anchor.Scrolling;
    }
}

interface IScrollState {
    pos: number,
    anchor: Anchor,
    height: number,
    frame: number,
    frame_time: number,
    velocity: number,
    /// Signifies if we are currently polling for scroll position
    active: boolean,
    /// If false, skip exactly one `scroll` event, then re-enable
    enabled: boolean,

    resize(height?: number): void;
    scroll(): void;
    load_prev(): void;
    load_next(): void;
}

var noop = () => { };

const DEFAULT_SCROLL_STATE: IScrollState = {
    anchor: Anchor.Bottom,
    pos: 0,
    height: 0,
    frame: 0,
    frame_time: 0.01666, // 1 / 60
    velocity: 0,
    active: false,
    enabled: true,
    resize: noop,
    scroll: noop,
    load_prev: noop,
    load_next: noop,
};

const high_res_now = performance.now ? () => performance.now() : () => Date.now();

function ema(current: number, next: number): number {
    return current * 0.9 + next * 0.1; // 10%

    //return (current + next) * 0.5;
}

export interface IInfiniteScrollProps {
    children: React.ReactNode,
    // load content on top
    load_prev: () => void,
    // load content on bottom
    load_next: () => void,
    start: Anchor,
    reset_on_changed?: any,
    containerClassName?: string,
    wrapperClassName?: string,
}

import "./infinite_scroll.scss";
export const InfiniteScroll = React.memo((props: IInfiniteScrollProps) => {
    let container_ref = useRef<HTMLDivElement>(null);

    let state = useMemo(() => {
        __DEV__ && console.log("Initializing scroll state...");

        var state = { ...DEFAULT_SCROLL_STATE };

        let container = container_ref.current!;
        if(!container) return state;

        state.scroll = () => {
            if(!state.enabled) return;

            let anchor = compute_at(container, container.clientHeight, container.clientHeight * 0.3),
                reached_top = anchor == Anchor.Top && state.anchor != Anchor.Top,
                reached_bottom = anchor == Anchor.Bottom && state.anchor != Anchor.Bottom;

            let new_pos = container.scrollTop;

            state.velocity = ema(state.velocity, (new_pos - state.pos) * state.frame_time);
            state.pos = new_pos;
            state.anchor = anchor;

            let predicted_pos = state.velocity + new_pos;

            if((reached_top || predicted_pos < 0) && anchor != Anchor.Bottom) {
                __DEV__ && console.log("PREDICTED TO TOP", state.frame_time, state.velocity, new_pos, predicted_pos);
                state.anchor = Anchor.Top;
                state.load_prev();
                state.velocity = 0;
            } else if(reached_bottom || (predicted_pos > container.scrollHeight && state.velocity > 0)) {
                __DEV__ && console.log("PREDICTED TO BOTTOM", state.frame_time, state.velocity, new_pos, predicted_pos);
                state.anchor = Anchor.Bottom;
                state.load_next();
                state.velocity = 0;
            }

            let max_frame = 1000.0 / state.frame_time;

            if(state.active && state.frame++ < max_frame) {
                let prev = high_res_now();
                requestAnimationFrame(() => {
                    state.frame_time = ema(state.frame_time, high_res_now() - prev);
                    state.scroll();
                });
            } else {
                __DEV__ && console.log("FPS:", max_frame);
                state.active = false;
                //console.info("Stopped polling");
            }
        };

        state.resize = (height: number | undefined) => {
            if(height !== undefined && height > 0) {
                let top = state.pos;

                if(state.anchor == props.start) {
                    if(props.start == Anchor.Bottom) {
                        top = container.scrollHeight;
                    } else {
                        top = 0;
                    }

                    __DEV__ && console.log("SCROLLING TO START: ", top);

                } else {
                    //console.log("HEIGHTS: ", container.scrollHeight, list.clientHeight, state.height, state.old_height);
                    //console.log("HEIGHTS: ", container.scrollHeight, height, state.height, state.pos, container.scrollTop);

                    let diff = height - state.height;
                    top = top + diff;
                }

                if(top != container.scrollTop) {
                    state.enabled = false;
                    container.scrollTo({ top });
                }

                state.pos = top;
                state.height = height;
            }
        };

        return state;
    }, [container_ref.current, props.reset_on_changed]);

    // force resize check when we absolutely know the DOM just changed
    useLayoutEffect(() => state.resize(container_ref.current?.scrollHeight), [props.children, state]);
    useLayoutEffect(() => {
        // force to start when changing rooms
        state.anchor = props.start;
        state.resize(container_ref.current?.scrollHeight)
    }, [props.reset_on_changed, state]);

    // only use the resize observer to stick to the bottom on tiny changes
    const { ref: wrapper_ref } = useResizeDetector<HTMLDivElement>({
        handleWidth: false,
        onResize: useCallback((_width, height) => {
            __DEV__ && console.log("INNER RESIZED!!!", state.anchor, props.start);

            //if(state.anchor == props.start) {
            state.active = false;
            state.velocity = 0;
            state.resize(height);
            //}
        }, [state]),
        observerOptions: { box: 'border-box' },
    });

    // TODO: Improve the behavior of this when resizing very fast, as the `small_anchor` is... small.
    useResizeDetector<HTMLDivElement>({
        targetRef: container_ref,
        handleWidth: false,
        onResize: useCallback((_width, clientHeight) => {
            __DEV__ && console.log("OUTER RESIZED!!!", state.anchor, props.start);

            let container = container_ref.current;
            if(!container || !clientHeight) return;

            // TODO: Adaptive based on how much the container resized?
            let small_anchor = compute_at(container, 50, 50);

            if(small_anchor == props.start) {
                state.active = false;
                state.resize(container.scrollHeight);
            }
        }, [state, container_ref.current]),
    });

    useEffect(() => {
        // this is refreshed when active_room or groups change!
        state.load_prev = once(() => props.load_prev());
        state.load_next = once(() => props.load_next());

        // if any of the below deps change, immediately record the current position in prep for resize
        return () => {
            let container = container_ref.current;
            if(container) { state.pos = container.scrollTop; }
        };
    }, [props.load_prev, props.load_next, props.children, state]);

    let on_scroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        state.frame = 0;

        if(!state.active && state.enabled) {
            state.active = true;
            state.velocity = 0; // be conservative and always start from rest
            state.scroll();
        }

        state.enabled = true;
    }, [state]);

    let on_wheel = useCallback((e: React.WheelEvent) => {
        if(state.enabled) {
            state.pos += e.deltaY;
        }
    }, [state]);

    let container_classes = "ln-inf-scroll__container ln-scroll-y ";
    if(props.containerClassName) {
        container_classes += props.containerClassName;
    }

    return (
        <div className={container_classes} ref={container_ref} onScroll={on_scroll} onWheel={on_wheel}>
            <div className="ln-inf-scroll__wrapper" ref={wrapper_ref}>
                {props.children}
            </div>
        </div>
    );
});