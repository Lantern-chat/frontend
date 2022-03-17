import { JSX, createContext, useContext, createSignal, createRenderEffect, onCleanup, createEffect, onMount, children, untrack, Accessor } from "solid-js";

import ResizeObserverPolyfill from "resize-observer-polyfill";

import { SUPPORTS_PASSIVE } from "lib/features";
import { IS_IOS_SAFARI } from "lib/user_agent";
import { createRef, Ref } from "ui/hooks/createRef";
import { createController, SetController } from "ui/hooks/createController";
import { createMicrotask } from "ui/hooks/createMicrotask";

import { useRootSelector } from "state/root";
import { selectPrefsFlag } from "state/selectors/prefs";
import { UserPreferenceFlags } from "state/models";

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
    gotoStart(): void;
    gotoStartSmooth(): void;
    scrollPageUp(): void;
    scrollPageDown(): void;
    scrollArrowUp(): void;
    scrollArrowDown(): void;
    get at_start(): boolean;
    get container(): HTMLDivElement;
    get wrapper(): HTMLDivElement;
}

const OBSERVER_OPTIONS: ResizeObserverOptions = { box: "border-box" };

export const InfiniteScrollContext = createContext<Accessor<InfiniteScrollController | null>>();

export function createInfiniteScrollIntersection<T extends HTMLElement>(
    ref: Ref<T>,
    opts: Pick<IntersectionObserverInit, 'rootMargin' | 'threshold'> = {},
) {
    let [visible, setVisible] = createSignal(false);

    createEffect(() => {
        let ifs = useContext(InfiniteScrollContext);

        if(ifs && ref.current) {
            let observer = new IntersectionObserver(entries => {
                entries.length && setVisible(entries[0].intersectionRatio > 0);
            }, { ...opts, root: ifs()!.container });

            observer.observe(ref.current);
            onCleanup(() => observer.disconnect());
        }
    });

    return visible;
}

const doTimeout = (cb: () => void) => setTimeout(cb, 100);
const doNow = (cb: () => void) => cb();

// Fucking Safari...
const clearLater = IS_IOS_SAFARI ? clearTimeout : cancelAnimationFrame;
const do_later = IS_IOS_SAFARI ? doTimeout : requestAnimationFrame;
const do_nowish = IS_IOS_SAFARI ? doNow : requestAnimationFrame;
const do_laterish = IS_IOS_SAFARI ? doTimeout : doNow;

export interface IInfiniteScrollProps {
    children: JSX.Element,
    wrapperClassList?: { [key: string]: boolean },
    containerClassList?: { [key: string]: boolean },

    load_prev?: () => void,
    load_next?: () => void,
    start: Anchor,

    onScroll?: (pos: number) => void,

    setController?: SetController<InfiniteScrollController>,
}

import "./infinite_scroll.scss";
export function InfiniteScroll(props: IInfiniteScrollProps) {
    let reduce_motion = useRootSelector(selectPrefsFlag(UserPreferenceFlags.ReduceAnimations));

    let container_ref = createRef<HTMLDivElement>(),
        wrapper_ref = createRef<HTMLDivElement>();

    let paused = false;

    let polling = false;
    let velocity = 0;

    let height = 0;
    let pos = 0;
    let anchor = props.start;

    let do_resize = () => {
        polling = false;
        velocity = 0;

        let container = container_ref.current!,
            new_height = container.scrollHeight;

        if(new_height == height || paused) {
            height = new_height;
            pos = container.scrollTop;
            return;
        }

        let top = pos, diff = 0;

        if(anchor == props.start) {
            top = (props.start == Anchor.Bottom) ? height : 0;
        } else {
            diff = new_height - height;
            top += diff;
        }

        pos = top;

        if(top != container.scrollTop || new_height != height) {
            if(diff > 0) {
                container.scrollBy({ top: diff, behavior: 'instant' as any });
            } else {
                // shrunk
                container.scrollTo({ top, behavior: 'instant' as any });
            }

            anchor = compute_at(container, top);

            props.onScroll?.(top);
        }

        height = new_height;
    };

    let fixing = false;
    let fix_frame: number | undefined;

    let fix_position = () => {
        let was_fixing = fixing;
        if(!fixing) {
            fixing = true;
            do_resize();
        }

        if(fix_frame != null) {
            clearLater(fix_frame); // NOTE: Was created by do_later
        }

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

        if(fix_frame != null) {
            clearLater(fix_frame);
        }

        fix_position();
    };

    let load_pending = false;

    let load_more = (prev: boolean) => {
        if(!load_pending) {
            let cb = prev ? props.load_prev : props.load_next;

            if(cb) {
                load_pending = true;
                cb();
            }

            polling = false;
        }
    }

    let on_resize = (entries: ResizeObserverEntry[], observer: ResizeObserver) => {
        console.log("RESIZED");
        fix_position()
    };

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
        let height = container.clientHeight;

        // TODO: Reduce motion
        container.scrollBy({ top: height * top, behavior: reduce_motion() ? 'auto' : 'smooth' });
    };

    /// MOUNTING

    // fix position on prop changes
    createEffect(() => {
        props.children, props.load_next, props.load_prev, fix_position();
        do_laterish(() => load_pending = false);
    });

    props.setController?.({
        gotoStart() { reset_position(); },
        scrollPageUp() { scroll_by(-0.9); }, // 9/10
        scrollPageDown() { scroll_by(0.9); }, // 9/10
        scrollArrowUp() { scroll_by(-0.2); }, // 1/5
        scrollArrowDown() { scroll_by(0.2); }, // 1/5
        get at_start() { return anchor == props.start; },
        get container() { return container_ref.current!; },
        get wrapper() { return wrapper_ref.current!; },
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

            container.scrollTo({ top: page_border });
            container.scrollTo({ top: page_end, behavior: 'smooth' });
        }
    });

    let observer = new ResizeObserver(on_resize);

    onMount(() => {
        let container = container_ref.current!;

        observer.observe(container, OBSERVER_OPTIONS);
        observer.observe(wrapper_ref.current!, OBSERVER_OPTIONS);

        container.addEventListener('scroll', on_scroll, SUPPORTS_PASSIVE && { passive: true });

        onCleanup(() => observer.disconnect());
    });

    return (
        <div
            ref={container_ref}
            className="ln-inf-scroll__container ln-scroll-y"
            classList={props.containerClassList}
        >
            <div
                ref={wrapper_ref}
                className="ln-inf-scroll__wrapper"
                classList={props.wrapperClassList}
            >
                {props.children}
            </div>
        </div>
    )
}