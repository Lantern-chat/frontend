import { createSignal, onMount, onCleanup, batch } from "solid-js";

import type { SignalOptions } from "solid-js/types/reactive/signal";

export type Refable = HTMLElement | undefined;

export interface Ref<T extends Refable> {
    (value: T): void;
    get current(): T;
}

interface FullRef<T extends Refable> extends Ref<T> {
    set _override(value: T);
    _reset(): void;
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
    let [get, set] = createSignal<T | undefined>(initial, options), ref = function(value: T) {
        set(value as any);
        onCleanup(() => set(initial as any));
    } as Ref<T>;

    return Object.defineProperties(ref, {
        'current': { get, enumerable: true, },
        '_override': { set },
        '_reset': { value: () => { set(initial as any); } }
    });

    //return Object.defineProperty(ref, 'current', { get, enumerable: true });
}

export type AnyRef<T extends Refable> = Ref<T> | ((value: T) => void);

/**
 * Forward ref values onto external refs, in addition to your own.
 *
 * @param own
 * @param maybe_refs
 * @returns
 */
export function composeRefs<T extends Refable>(...maybe_refs: Array<AnyRef<T> | null | undefined>): Ref<T> {
    let simple: Array<AnyRef<T>> = [], complex: Array<FullRef<T>> = [];

    for(let ref of maybe_refs) {
        if(typeof ref === 'function') {
            if('_override' in ref) {
                complex.push(ref as FullRef<T>);
            } else {
                simple.push(ref);
            }
        }
    }

    if(complex.length == 1 && simple.length == 0) {
        return complex[0];
    }

    let own = complex.length ? complex[0] : createRef<T>(),
        override_complex = (value: T) => batch(() => {
            for(let ref of complex) {
                ref._override = value;
            }
        }),
        reset_complex = () => batch(() => {
            for(let ref of complex) {
                ref._reset();
            }
        });

    let ref = function(value: T) {
        if(complex.length) {
            __DEV__ && console.log("Setting complex refs");
            onCleanup(() => {
                __DEV__ && console.log("Resetting complex refs");
                reset_complex();
            });

            override_complex(value);
        }

        for(let ref of simple) {
            ref(value);
        }
    } as Ref<T>;

    return Object.defineProperties(ref, {
        'current': { enumerable: true, get: () => own.current },
        '_override': { set: override_complex },
        '_reset': { value: reset_complex }
    });
}