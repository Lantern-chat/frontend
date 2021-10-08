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

    if(scroll_top < top_threshold) {
        return Anchor.Top;
    } else if((scroll_height - scroll_top) < bottom_threshold) {
        return Anchor.Bottom;
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
    active: boolean,

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
    resize: noop,
    scroll: noop,
    load_prev: noop,
    load_next: noop,
};

const high_res_now = performance.now ? () => performance.now() : () => Date.now();

function ema(current: number, next: number): number {
    return current * 0.7 + next * 0.3; // 30%

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
        var state = { ...DEFAULT_SCROLL_STATE };

        let container = container_ref.current!;
        if(!container) return state;

        state.scroll = () => {
            let anchor = compute_at(container, window.innerHeight * 0.5, window.innerHeight * 0.25),
                reached_top = anchor == Anchor.Top && state.anchor != Anchor.Top,
                reached_bottom = anchor == Anchor.Bottom && state.anchor != Anchor.Bottom;

            let new_pos = container.scrollTop;

            state.velocity = ema(state.velocity, (new_pos - state.pos) * state.frame_time);
            state.pos = new_pos;
            state.anchor = anchor;

            let predicted_pos = state.velocity + new_pos;
            //console.log(state.frame_time, state.velocity, new_pos, predicted_pos);

            if(reached_top || predicted_pos < 0) {
                state.anchor = Anchor.Top;
                state.load_prev();
            } else if(reached_bottom || predicted_pos > container.scrollHeight) {
                state.anchor = Anchor.Bottom;
                state.load_next();
            }

            let max_frame = 1.0 / state.frame_time;

            if(state.frame++ < max_frame && state.active) {
                let prev = high_res_now();
                requestAnimationFrame(() => {
                    state.frame_time = ema(state.frame_time, high_res_now() - prev);
                    state.scroll();
                });
            } else {
                state.active = false;
                //console.info("Stopped polling");
            }
        };

        state.resize = (height: number | undefined) => {
            if(height !== undefined && height != state.height && height > 0) {
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
        onResize: useCallback((_width, height) => {
            if(state.anchor == props.start) {
                //console.log("HEREERERERER");
                state.active = false;
                state.resize(height);
            }
        }, [state]),
        observerOptions: { box: 'border-box' },
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

    let on_scroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
        state.frame = 0;

        if(!state.active) {
            state.active = true;
            state.velocity = 0; // be conservative and always start from rest
            state.scroll();
        }
    }, [state]);

    let container_classes = "ln-inf-scroll__container ln-scroll-y ";
    if(props.containerClassName) {
        container_classes += props.containerClassName;
    }

    return (
        <div className={container_classes} ref={container_ref} onScroll={on_scroll}>
            <div className={"ln-inf-scroll__wrapper"} ref={wrapper_ref}>
                {props.children}
            </div>
        </div>
    );
});