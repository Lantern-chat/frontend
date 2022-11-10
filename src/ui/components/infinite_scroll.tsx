import { JSX, createContext, useContext, createSignal, onCleanup, createEffect, onMount, Accessor, createMemo, createRenderEffect } from "solid-js";

import ResizeObserverPolyfill from "resize-observer-polyfill";

import { SUPPORTS_PASSIVE } from "lib/features";
import { IS_IOS_SAFARI } from "lib/user_agent";
import { createRef, Ref } from "ui/hooks/createRef";
import { SetController } from "ui/hooks/createController";
import { runBatched } from "ui/hooks/runBatched";

import { usePrefs } from "state/contexts/prefs";

export const enum Anchor {
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

function ema(current: number, next: number, size: number = 0.5): number {
    return (1.0 - size) * current + size * next;

    //return current * 0.95 + next * 0.05; // 5%
    //return (current + next) * 0.5;
}

export interface InfiniteScrollController {
    pause(paused: boolean): void;
    gotoStart(): void;
    gotoStartSmooth(): void;
    scrollPageUp(): void;
    scrollPageDown(): void;
    scrollArrowUp(): void;
    scrollArrowDown(): void;
    get at_start(): boolean;
    get container(): HTMLDivElement;
    get wrapper(): HTMLDivElement;

    clientRect(): DOMRectReadOnly;
    clientWidth(): number;
    clientHeight(): number;
    scrollHeight(): number;
}

const OBSERVER_OPTIONS: ResizeObserverOptions = { box: "border-box" };

export const InfiniteScrollContext = /*#__PURE__*/ createContext<Accessor<InfiniteScrollController>>(null! as Accessor<InfiniteScrollController>);

export function createInfiniteScrollIntersection<T extends HTMLElement>(
    ref: Ref<T | undefined>,
    opts: Pick<IntersectionObserverInit, 'rootMargin' | 'threshold'> = {},
    enable: Accessor<boolean> = () => true,
) {
    let [visible, setVisible] = createSignal(false);

    // using createEffect will re-run (and cleanup) when enable(), ifs or ref.current change
    createEffect(() => {
        if(enable() && ref.current) {
            let ifs = useContext(InfiniteScrollContext);
            let observer = new IntersectionObserver(entries => {
                entries.length && runBatched(() => setVisible(entries[0].intersectionRatio > 0), 0);
            }, { ...opts, root: ifs().container });

            observer.observe(ref.current);
            onCleanup(() => observer.disconnect());
        }
    });

    return visible;
}

export function createInfiniteScrollIntersectionTrigger<T extends HTMLElement>(
    ref: Ref<T | undefined>,
    opts: Pick<IntersectionObserverInit, 'rootMargin' | 'threshold'> = {},
) {
    let [visible, setVisible] = createSignal(false);

    createRenderEffect(() => {
        if(ref.current) {
            let ifs = useContext(InfiniteScrollContext),
                o: { o?: IntersectionObserver } = {},
                set_visible = () => setVisible(true),
                do_batch = false, // only batch if not visible on observer "mount"
                cleanup = () => {
                    o.o?.disconnect();
                    o.o = undefined;
                };

            o.o = new IntersectionObserver(entries => {
                if(entries.length && entries[0].intersectionRatio > 0) {
                    do_batch ? runBatched(set_visible) : set_visible();
                    cleanup();
                } else {
                    do_batch = true;
                }
            }, { ...opts, root: ifs().container });

            o.o.observe(ref.current);
            onCleanup(cleanup);
        }
    });

    return visible;
}

const doTimeout = (cb: () => void) => setTimeout(cb, 50);
const doNow = (cb: () => void) => cb();

const DO_SAFARI_HACKS = true && IS_IOS_SAFARI;

// Fucking Safari...
const clearLater = DO_SAFARI_HACKS ? clearTimeout : cancelAnimationFrame;
const do_later = DO_SAFARI_HACKS ? doTimeout : requestAnimationFrame;
const do_nowish = DO_SAFARI_HACKS ? doNow : requestAnimationFrame;
const do_laterish = DO_SAFARI_HACKS ? doTimeout : doNow;

export interface IInfiniteScrollProps {
    children: JSX.Element,
    wrapperClassList?: { [key: string]: boolean },
    containerClassList?: { [key: string]: boolean },

    load_prev?: () => Promise<void>,
    load_next?: () => Promise<void>,
    start: Anchor,

    onScroll?: (pos: number) => void,

    setController?: SetController<InfiniteScrollController>,
}

import "./infinite_scroll.scss";
export function InfiniteScroll(props: IInfiniteScrollProps) {
    let reduce_motion = usePrefs().ReduceAnimations;

    let container_ref = createRef<HTMLDivElement>(),
        wrapper_ref = createRef<HTMLDivElement>();

    let paused = false;

    let polling = false;
    let velocity = 0;

    let height = 0;
    let pos = 0;
    let anchor = props.start;

    let [scrollHeight, setScrollHeight] = createSignal(height);

    let cheight = 0;

    let do_resize = () => {
        polling = false;
        velocity = 0;

        let container = container_ref.current!,
            new_cheight = container.clientHeight,
            new_height = container.scrollHeight;

        // don't adjust position if the container height is the same
        // OR even if it did change don't fix if it's not at the start.
        let ignore_cheight_change = cheight == new_cheight || anchor != props.start;

        if((ignore_cheight_change && new_height == height) || paused) {
            pos = container.scrollTop;
            return;
        }

        let top = pos, diff = 0;

        if(anchor == props.start) {
            top = (props.start == Anchor.Bottom) ? new_height : 0;
        } else {
            diff = new_height - height;
            top += diff;
        }

        pos = top;
        cheight = new_cheight;
        setScrollHeight(height = new_height);

        if(top != container.scrollTop) {
            if(diff != 0) {
                // relative positioning
                container.scrollBy({ top: diff, behavior: 'instant' as any });
            } else {
                // absolute positioning to start
                container.scrollTo({ top, behavior: 'instant' as any });
            }

            anchor = compute_at(container, top);

            props.onScroll?.(top);
        }
    };

    let fixing = false;
    let fix_frame: number | undefined;

    let fix_position = () => {
        let was_fixing = fixing;
        if(!fixing) {
            fixing = true;
            do_resize();
        }

        clearLater(fix_frame as any); // NOTE: Was created by do_later

        fix_frame = do_later(() => {
            fixing = false;

            if(was_fixing) {
                fix_position();
            }
        });
    };

    let reset_position = () => {
        pos = height = 0;
        anchor = props.start;

        clearLater(fix_frame!);

        fix_position();
    };

    let load_pending = false;

    let load_more = (prev: boolean) => {
        if(!load_pending) {
            let cb = prev ? props.load_prev : props.load_next;

            if(cb) {
                load_pending = true;

                cb().then(() => {
                    load_pending = false;
                });
            }

            polling = false;
        }
    }

    let start_time: number = 0;
    let frame_time: number = 1 / 60;

    let do_scroll = (now: number) => {
        if(load_pending) return;

        let container = container_ref.current!,
            new_pos = container.scrollTop,
            new_anchor = compute_at(container, new_pos),
            reached_top = new_anchor == Anchor.Top && anchor != Anchor.Top,
            reached_bottom = new_anchor == Anchor.Bottom && anchor != Anchor.Bottom;

        {
            let predicted_velocity = (new_pos - pos) / frame_time,
                sign = Math.sign(predicted_velocity);

            // limit the absolute velocity to max(0.25, 1.5*existing)
            // where max() helps if initial velocity is zero.
            predicted_velocity = sign * Math.min(
                Math.max(0.25, Math.abs(velocity) * 1.5),
                Math.abs(predicted_velocity)
            );

            velocity = ema(velocity, predicted_velocity, 0.25);
        }

        pos = new_pos;
        anchor = new_anchor;

        // velocity is in pixels/ms, so get that to pixels/second
        let predicted_pos = 1000 * velocity + pos;
        let predict_top = predicted_pos < 0 && anchor != Anchor.Top;
        let predict_bottom = predicted_pos > container.scrollHeight && anchor != Anchor.Bottom;

        if(reached_top || predict_top) {
            anchor = Anchor.Top;
            load_more(true);

            __DEV__ && console.log("AT TOP:", predict_top, velocity);

        } else if(reached_bottom || predict_bottom) {
            anchor = Anchor.Bottom;

            __DEV__ && console.log("AT BOTTOM:", predict_bottom, velocity);
        }

        // 1 second polling
        if((now - start_time) < 1000) {
            requestAnimationFrame(() => {
                if(polling) {
                    let new_frame = performance.now();
                    frame_time = ema(frame_time, new_frame - now);
                    do_scroll(new_frame);
                }
            });
        } else {
            polling = false;
        }
    };

    let on_scroll = () => {
        if(load_pending || fixing) return;

        let new_pos = container_ref.current!.scrollTop;

        if(new_pos != pos) {
            start_time = performance.now();
            if(!polling) {
                polling = true;
                velocity = 0;
                do_scroll(start_time);
            }

            props.onScroll?.(new_pos);
        }
    };

    let scroll_by = (top: number) => {
        let container = container_ref.current!;
        container.scrollBy({
            top: container.clientHeight * top,
            behavior: reduce_motion() ? 'auto' : 'smooth'
        });
    };

    let [clientRect, setClientRect] = createSignal(new DOMRect());

    let on_resize = (entries: ResizeObserverEntry[], observer: ResizeObserver) => {
        __DEV__ && console.log("RESIZED");
        fix_position();

        for(let entry of entries) {
            if(entry.target === container_ref.current) {
                setClientRect(container_ref.current.getBoundingClientRect());
                break;
            }
        }
    };

    /// MOUNTING

    let observer: ResizeObserver;

    onMount(() => {
        fix_position();

        let container = container_ref.current!;

        observer = new ResizeObserverPolyfill(on_resize);

        observer.observe(container, OBSERVER_OPTIONS);
        observer.observe(wrapper_ref.current!, OBSERVER_OPTIONS);

        container.addEventListener('scroll', on_scroll, SUPPORTS_PASSIVE ? { passive: true } : false);

        onCleanup(() => {
            __DEV__ && console.log("Cleaning up IFS");
            observer.disconnect();
            container?.removeEventListener('scroll', on_scroll);
            polling = false;
        });
    });

    // NOTE: See feed.tsx for the controlled being used to reset the ifs on active room change

    let memoizedClientRect = createMemo(clientRect);

    props.setController?.({
        pause(p: boolean) {
            __DEV__ && console.log("Paused IFS:", p);
            paused = p;
        },
        gotoStart() { reset_position(); },
        scrollPageUp() { scroll_by(-0.9); }, // 9/10
        scrollPageDown() { scroll_by(0.9); }, // 9/10
        scrollArrowUp() { scroll_by(-0.2); }, // 1/5
        scrollArrowDown() { scroll_by(0.2); }, // 1/5
        get at_start() { return anchor == props.start; },
        get container() { return container_ref.current!; },
        get wrapper() { return wrapper_ref.current!; },
        clientRect: memoizedClientRect,
        scrollHeight,
        clientHeight: createMemo(() => { return memoizedClientRect().height; }),
        clientWidth: createMemo(() => { return memoizedClientRect().width; }),
        gotoStartSmooth() {
            let container = container_ref.current!;

            let clientHeight = container.clientHeight,
                scrollHeight = container.scrollHeight,
                page_border = clientHeight,
                page_end = props.start == Anchor.Bottom ? scrollHeight : 0;

            props.onScroll?.(page_end);

            if(reduce_motion()) {
                container.scrollTo({ top: page_end });
                return;
            }

            if(props.start == Anchor.Bottom) {
                // scrollHeight - clientHeight is the scrollTop of the end, so clientHeight*2 to start one page above
                page_border = scrollHeight - clientHeight * 2;
            }

            container.scrollTo({ top: page_border, behavior: 'instant' as any });
            do_laterish(() => container.scrollTo({ top: page_end, behavior: 'smooth' }));
        }
    });

    return (
        <div
            ref={container_ref}
            class="ln-inf-scroll__container ln-scroll-y"
            classList={props.containerClassList}
        >
            <div
                ref={wrapper_ref}
                class="ln-inf-scroll__wrapper"
                classList={props.wrapperClassList}
            >
                {props.children}
            </div>
        </div>
    )
}