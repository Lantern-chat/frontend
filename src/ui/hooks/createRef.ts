import { createSignal, onMount, onCleanup, createEffect, untrack, batch } from "solid-js";

import type { SignalOptions } from "solid-js/types/reactive/signal";

export type Refable = HTMLElement | undefined;

export interface Ref<T extends Refable> {
    (value: T): void;
    get current(): T;
}

/**
 * Intelligent "ref" object for accessing underlying DOM nodes in a reactive manner.
 *
 * Usages of `ref.current` are tracked and changes to it propogated like a signal.
 *
 * The ref will also "clean up" after itself, resetting to the
 * initial value when no longer assigned anywhere.
 */
export function createRef<T extends Refable>(): Ref<T | undefined>;
export function createRef<T extends Refable>(initial: T, options?: SignalOptions<T>): Ref<T>;
export function createRef<T extends Refable>(initial?: T, options?: SignalOptions<T>): Ref<T | undefined> {
    let [get, set] = createSignal<T | undefined>(initial, options);

    let counter = 0, ref = function(value: T) {
        set(value as any);

        // on each use of `ref`, increment the counter and setup the cleanup hook
        // only when all cleanup hooks have run should it reset the ref.
        // This helps to avoid cases where the ref is set multiple times, intentionally
        // overwritten, and we don't want it reverting in the middle of that.
        counter++; onCleanup(() => --counter || set(initial as any));
    } as Ref<T>;

    return Object.defineProperty(ref, 'current', { get, set, enumerable: true });
}

export type AnyRef<T extends Refable> = Ref<T> | ((value: T) => void);

/**
 * Forward ref values onto external refs, in addition to your own.
 *
 * @param own
 * @param maybe_refs
 * @returns
 */
export function composeRefs<T extends Refable>(any_own: Ref<T>, ...maybe_refs: Array<AnyRef<T> | null | undefined>): Ref<T>
export function composeRefs<T extends Refable>(any_own: AnyRef<T> | undefined | null, ...maybe_refs: Array<AnyRef<T> | null | undefined>): Ref<T | undefined>
export function composeRefs<T extends Refable>(any_own: AnyRef<T> | undefined | null, ...maybe_refs: Array<AnyRef<T> | null | undefined>): Ref<T | undefined> {
    let own: Ref<T | undefined>;

    if(typeof any_own === 'function' && 'current' in any_own) { own = any_own; }
    else { own = createRef<T>(); maybe_refs.unshift(any_own); }

    // preprocess refs
    let refs: Array<AnyRef<T>> = [];
    for(let ref of maybe_refs) {
        if(ref) {
            if('current' in ref) {
                refs.push(value => (ref as any).current = value); // cheating
            } else {
                refs.push(value => untrack(() => ref!(value)));
            }
        }
    }

    if(refs.length) {
        // this "composes" refs by triggering updates when `own` updates,
        // then just overwriting the old values. This makes external ref updates
        // entirely dependent on `own`'s usage scope, without too much complication.
        createEffect(() => {
            let value = own.current;

            batch(() => {
                for(let ref of refs) {
                    ref(value as T);
                }
            });
        });
    }

    return own;
}

/**
 * Variant of `onMount` that takes a `Ref<T>`, and will invoke the callback
 * as soon as that ref has been set.
 *
 * @param ref
 * @param cb
 */
export function onMountRef<T extends Refable>(ref: Ref<T>, cb: (t: T) => void) {
    onMount(() => {
        if(ref.current) {
            cb(ref.current);
        } else {
            createEffect(() => {
                if(ref.current) {
                    untrack(() => cb(ref.current));
                }
            });
        }
    });
}