import { shallowEqualObjects } from "lib/compare";
import React, { createRef } from "react";

// will automatically use native ResizeObserver if available
import ResizeObserverPolyfill from "resize-observer-polyfill";

import { SUPPORTS_PASSIVE } from "lib/features";
import { IS_IOS_SAFARI } from "lib/user_agent";

export enum Anchor {
    Top,
    Scrolling,
    Bottom,
}

function compute_at(e: HTMLElement, top: number): Anchor {
    let inner_height = e.scrollHeight - e.offsetHeight,
        top_threshold = e.clientHeight * 0.7,
        bottom_threshold = e.clientHeight * 0.3;

    if((inner_height - top) < bottom_threshold) {
        return Anchor.Bottom;
    } else if(top < top_threshold) {
        return Anchor.Top;
    } else {
        return Anchor.Scrolling;
    }
}

const high_res_now = performance.now ? () => performance.now() : () => Date.now();

function ema(current: number, next: number, size: number = 0.5): number {
    return (1.0 - size) * current + size * next;

    //return current * 0.95 + next * 0.05; // 5%
    //return (current + next) * 0.5;
}

const doTimeout = (cb: () => void) => setTimeout(cb, 100);
const doNow = (cb: () => void) => cb();

// Fucking Safari...
const clearLater = IS_IOS_SAFARI ? clearTimeout : cancelAnimationFrame;
const do_later = IS_IOS_SAFARI ? doTimeout : requestAnimationFrame;
const do_nowish = IS_IOS_SAFARI ? doNow : requestAnimationFrame;
const do_laterish = IS_IOS_SAFARI ? doTimeout : doNow;

interface IInfiniteScrollProps {
    children: React.ReactNode,
    // load content on top
    load_prev?: () => void,
    // load content on bottom
    load_next?: () => void,
    start: Anchor,
    reset_on_changed?: any,
    containerClassName?: string,
    wrapperClassName?: string,
    onScroll?: (pos: number) => void,
}

const OBSERVER_OPTIONS: ResizeObserverOptions = { box: "border-box" };

import "./infinite_scroll.scss";
export class InfiniteScroll extends React.Component<IInfiniteScrollProps, {}> {

    public goToStart() {
        this.resetPosition();
    }

    public goToStartSmooth() {
        // TODO: Scroll to one page from start, then smooth scroll the rest of the way
    }

    public scrollPageUp() {
        this.scrollBy(-0.8); // 4/5
    }

    public scrollPageDown() {
        this.scrollBy(0.8); // 4/5
    }

    public scrollArrowUp() {
        this.scrollBy(-0.1); // 1/10
    }

    public scrollArrowDown() {
        this.scrollBy(0.1); // 1/10
    }

    scrollBy(top: number) {
        let container = this.containerRef.current;
        if(container) {
            let height = container.clientHeight;
            (container as any).scrollBy({ top: height * top, behavior: 'smooth' });
        }
    }

    observer: ResizeObserver;

    containerRef: React.RefObject<HTMLDivElement> = createRef();
    wrapperRef: React.RefObject<HTMLDivElement> = createRef();

    constructor(props: IInfiniteScrollProps) {
        super(props);

        this.observer = new ResizeObserverPolyfill((e, o) => this.onResize(e, o));
    }

    observedContainerElement: HTMLDivElement | null = null;
    observedWrapperElement: HTMLDivElement | null = null;

    componentDidMount() {
        this.attachObserver();
    }

    shouldComponentUpdate(nextProps: IInfiniteScrollProps) {
        return !shallowEqualObjects(this.props, nextProps);
    }

    getSnapshotBeforeUpdate(): null {
        let container = this.containerRef.current;
        if(container) {
            __DEV__ && console.log("Getting snapshot")
            // record or reset everything before DOM update
            this.pos = container.scrollTop;
            this.height = container.scrollHeight;
            this.polling = false;
            this.velocity = 0;
        }

        return null;
    }

    componentDidUpdate(prevProps: IInfiniteScrollProps) {
        // If the DOM changed significantly, reattach observer
        this.attachObserver();

        if(prevProps.children != this.props.children ||
            prevProps.load_next != this.props.load_next ||
            prevProps.load_prev != this.props.load_prev) {
            __DEV__ && console.log("COMPONENT DID UPDATE");

            this.fixPosition();

            // delay this, let it get scroll events out of its system
            do_laterish(() => { this.load_pending = false; });
        }

        if(prevProps.reset_on_changed != this.props.reset_on_changed) {
            __DEV__ && console.log("Resetting infinite scroll");

            this.resetPosition();
        }
    }

    resetPosition() {
        // reset a bunch of stuff
        this.anchor = this.props.start;
        this.pos = 0;
        this.height = 0;

        if(this.fix_frame != null) {
            clearLater(this.fix_frame);
        }

        this.fixPosition();
    }

    componentWillUnmount() {
        this.observer.disconnect();
    }

    /// attaches (or reattaches) the resize observer to both container and wrapper elements
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

            if(__DEV__ && SUPPORTS_PASSIVE) {
                console.log("Attaching scroll listener with passive mode");
            }

            container.addEventListener('scroll', () => this.onScroll(), SUPPORTS_PASSIVE ? { passive: true } : false);
        }
    }

    fixing: boolean = false;
    fix_frame?: number;

    fixPosition() {
        let was_fixing = this.fixing;
        if(!this.fixing) {
            __DEV__ && console.log("FIXING NOW");
            this.fixing = true;
            this.doResize();
        }

        if(this.fix_frame != null) {
            clearLater(this.fix_frame); // NOTE: Was created by do_later
        }

        if(__DEV__ && was_fixing) {
            console.log("FIXING LATER");
        }

        this.fix_frame = do_later(() => {
            this.fixing = false;

            // try again this frame
            if(was_fixing) {
                __DEV__ && console.log("FIXING LATER NOW");
                this.fixPosition();
            }
        });
    }

    load_pending: boolean = false;

    loadMore(prev: boolean) {
        if(!this.load_pending) {
            let cb = prev ? this.props.load_prev : this.props.load_next;

            if(cb) {
                cb();
                this.load_pending = true;
            }

            this.polling = false;
        }
    }

    pos: number = 0;
    anchor: Anchor = this.props.start;
    height: number = 0;

    doResize() {
        __DEV__ && console.log("DO RESIZE");

        // stop polling on any resize, so adjustments can be made without interference
        this.polling = false;
        this.velocity = 0;

        let container = this.containerRef.current!,
            height = container.scrollHeight;

        if(height == this.height) return;

        let top = this.pos, diff = 0;

        if(this.anchor == this.props.start) {
            // if start is at the bottom, shift top to full height, which will be automatically clamped
            top = (this.props.start == Anchor.Bottom) ? height : 0;
            __DEV__ && console.log("SCROLLING TO START: ", top);
        } else {
            diff = height - this.height;
            top += diff;
        }

        this.pos = top;

        if(top != container.scrollTop || height != this.height) {
            if(diff > 0) {
                (container as any).scrollBy({ top: diff, behavior: 'instant' });
            } else {
                (container as any).scrollTo({ top, behavior: 'instant' });
            }

            __DEV__ && console.log("CORRECTED TO: ", top);

            this.anchor = compute_at(container, top);

            if(this.props.onScroll) {
                this.props.onScroll(this.pos);
            }
        }

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

        let container = this.containerRef.current!,
            new_pos = container.scrollTop,
            anchor = compute_at(container, new_pos),
            reached_top = anchor == Anchor.Top && this.anchor != Anchor.Top,
            reached_bottom = anchor == Anchor.Bottom && this.anchor != Anchor.Bottom;

        //__DEV__ && console.log("Computing anchor with height: ", container.clientHeight, container.scrollTop);

        {
            let predicted_velocity = (new_pos - this.pos) / this.frame_time,
                sign = Math.sign(predicted_velocity);

            // limit the absolute velocity to max(0.25, 1.5*existing)
            // where max() helps if initial velocity is zero.
            predicted_velocity = sign * Math.min(
                Math.max(0.25, Math.abs(this.velocity) * 1.5),
                Math.abs(predicted_velocity)
            );

            this.velocity = ema(this.velocity, predicted_velocity, 0.25);
        }

        this.pos = new_pos;
        this.anchor = anchor;

        // velocity is in pixels/ms, so get that to pixels/second
        let predicted_pos = 1000 * this.velocity + new_pos;

        let predict_top = predicted_pos < 0 && anchor != Anchor.Top;
        let predict_bottom = predicted_pos > container.scrollHeight && anchor != Anchor.Bottom;

        if(reached_top || predict_top) {
            this.anchor = Anchor.Top;
            this.loadMore(true);

            __DEV__ && console.log("AT TOP: ", predict_top, this.velocity);

        } else if(reached_bottom || predict_bottom) {
            this.anchor = Anchor.Bottom;
        }

        // 1 second polling
        if((now - this.start_time) < 1000) {
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

    /// SECTION: Event Callbacks

    onResize(_entries: ResizeObserverEntry[], _observer: ResizeObserver) {
        __DEV__ && console.log("RESIZED");
        this.fixPosition();
    }

    onScroll() {
        // If there is a load pending, there is no point in checking for anchor position,
        if(this.load_pending || this.fixing) return;

        let pos = this.containerRef.current!.scrollTop;

        // calls to `scrollTo` may trigger a scroll event, which will be at this.pos so ignore that.
        if(this.pos != pos) {
            this.start_time = high_res_now();
            if(!this.polling) {
                this.polling = true;
                this.velocity = 0;
                this.doScroll(this.start_time);
            }

            if(this.props.onScroll) {
                this.props.onScroll(pos);
            }
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
            <div ref={this.containerRef} className={container_classes}>
                <div className={wrapper_classes} ref={this.wrapperRef}>
                    {this.props.children}
                </div>
            </div>
        )
    }
}