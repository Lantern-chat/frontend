import { shallowEqualObjects } from "lib/compare";
import React, { createRef } from "react";

import ResizeObserverPolyfill from "resize-observer-polyfill";

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

const high_res_now = performance.now ? () => performance.now() : () => Date.now();

function ema(current: number, next: number): number {
    return current * 0.7 + next * 0.3; // 30%

    //return (current + next) * 0.5;
}


interface IInfiniteScrollProps {
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

const OBSERVER_OPTIONS: ResizeObserverOptions = { box: "border-box" };

import "./infinite_scroll.scss";
export class InfiniteScroll extends React.Component<IInfiniteScrollProps, {}> {
    observer: ResizeObserver;

    containerRef: React.RefObject<HTMLDivElement> = createRef();
    wrapperRef: React.RefObject<HTMLDivElement> = createRef();

    constructor(props: IInfiniteScrollProps) {
        super(props);

        this.observer = new ResizeObserverPolyfill((e, o) => this.onResize(e, o));
    }

    observedContainerElement: Element | null = null;
    observedWrapperElement: Element | null = null;

    componentDidMount() {
        this.attachObserver();
    }

    shouldComponentUpdate(nextProps: IInfiniteScrollProps) {
        return !shallowEqualObjects(this.props, nextProps);
    }

    componentDidUpdate(prevProps: IInfiniteScrollProps) {
        // If the DOM changed significantly, reattach observer
        this.attachObserver();

        if(prevProps.children != this.props.children) {
            this.fixPosition();

            this.load_pending = false;
        }

        if(prevProps.reset_on_changed != this.props.reset_on_changed) {
            __DEV__ && console.log("Resetting infinite scroll");

            // reset a bunch of stuff
            this.anchor = this.props.start;
            this.pos = 0;
            this.height = 0;

            this.fixPosition();
        }
    }

    componentWillUnmount() {
        this.observer.disconnect();
    }

    attachObserver() {
        let wrapper = this.wrapperRef.current,
            container = this.containerRef.current;

        if(wrapper && wrapper !== this.observedWrapperElement) {
            if(this.observedWrapperElement) {
                this.observer.unobserve(this.observedWrapperElement);
            }

            this.observer.observe(wrapper, OBSERVER_OPTIONS);
            this.observedWrapperElement = wrapper;
        }

        if(container && container !== this.observedContainerElement) {
            if(this.observedContainerElement) {
                this.observer.unobserve(this.observedContainerElement);
            }

            this.observer.observe(container, OBSERVER_OPTIONS);
            this.observedContainerElement = container;
        }
    }

    getSnapshotBeforeUpdate(): null {
        let container = this.containerRef.current;
        if(container) {
            this.pos = container.scrollTop;
            this.height = container.scrollHeight;
            this.polling = false;
        }

        return null;
    }

    frame_throttle: boolean = false;

    fixPosition() {
        //if(!this.frame_throttle) {
        //    this.frame_throttle = true;

        // stop polling on any resize, so adjustments can be made without interference
        this.polling = false;
        this.velocity = 0;
        this.doResize(this.containerRef.current!.scrollHeight);

        //    requestAnimationFrame(() => { this.frame_throttle = false; });
        //}
    }

    load_pending: boolean = false;

    loadMore(prev: boolean) {
        if(!this.load_pending) {
            prev ? this.props.load_prev() : this.props.load_next();
            this.load_pending = true;
        }
    }

    pos: number = 0;
    anchor: Anchor = this.props.start;
    height: number = 0;

    doResize(height: number) {
        if(height == this.height) return;
        let container = this.containerRef.current!;

        let top = this.pos;

        if(this.anchor == this.props.start) {
            if(this.props.start == Anchor.Bottom) {
                top = container.scrollHeight;
            } else {
                top = 0;
            }

            __DEV__ && console.log("SCROLLING TO START: ", top);
        } else {
            // top += diff
            top += height - this.height;
        }

        if(top != container.scrollTop) {
            container.scrollTo({ top });
        }

        this.pos = top;
        this.height = height;
    }

    velocity: number = 0;
    polling: boolean = false;
    start_time: number = 0;
    frame_time: number = 1 / 60;

    doScroll(now: number) {
        // no point in doing scroll checking if its purpose is being served, so avoid the overhead
        // and complications
        if(this.load_pending) return;

        let container = this.containerRef.current!;

        let anchor = compute_at(container, container.clientHeight, container.clientHeight * 0.3),
            reached_top = anchor == Anchor.Top && this.anchor == Anchor.Scrolling,
            reached_bottom = anchor == Anchor.Bottom && this.anchor == Anchor.Scrolling;

        let new_pos = container.scrollTop;

        if(this.polling) {
            this.velocity = ema(this.velocity, (new_pos - this.pos) * this.frame_time);
        } else {
            this.velocity = 0;
        }

        this.pos = new_pos;
        this.anchor = anchor;

        let predicted_pos = this.velocity * 2 + new_pos;

        let predict_top = predicted_pos < 0 && anchor == Anchor.Scrolling;
        let predict_bottom = predicted_pos > container.scrollHeight && anchor == Anchor.Scrolling;

        if(reached_top || predict_top) {
            this.anchor = Anchor.Top;
            this.loadMore(true);
        } else if(reached_bottom || predict_bottom) {
            this.anchor = Anchor.Bottom;
        }

        if(this.polling) {
            let diff = now - this.start_time;

            // 1 second polling
            if(diff < 1000) {
                requestAnimationFrame(() => {
                    if(this.polling) {
                        let new_frame = high_res_now();
                        this.frame_time = ema(this.frame_time, new_frame - now);
                        this.doScroll(new_frame);
                    }
                });
            } else {
                this.polling = false;
            }
        }
    }

    /// SECTION: Event Callbacks

    onResize(entries: ResizeObserverEntry[], observer: ResizeObserver) {
        this.fixPosition();
    }

    scroll_throttle: boolean = false;

    scrollThrottle(): boolean {
        if(this.scroll_throttle) return true;
        this.scroll_throttle = true;
        requestAnimationFrame(() => { this.scroll_throttle = false; });
        return false;
    }

    onScroll(_e: React.UIEvent<HTMLDivElement>) {
        if(this.scrollThrottle()) return;

        this.start_time = high_res_now();

        if(!this.polling) {
            this.polling = true;
            this.velocity = 0;
            this.doScroll(this.start_time);
        }
    }

    render() {
        let container_classes = "ln-inf-scroll__container ln-scroll-y ",
            wrapper_classes = "ln-inf-scroll__wrapper ";
        if(this.props.containerClassName) {
            container_classes += this.props.containerClassName;
        }
        if(this.props.wrapperClassName) {
            wrapper_classes += this.props.wrapperClassName;
        }

        return (
            <div ref={this.containerRef}
                className={container_classes}
                onScroll={e => this.onScroll(e)}
            >
                <div className={wrapper_classes} ref={this.wrapperRef}>
                    {this.props.children}
                </div>
            </div>
        )
    }
}