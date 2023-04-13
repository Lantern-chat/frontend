import { onCleanup, onMount, batch, createComputed, Accessor } from "solid-js";

import { createTrigger, Trigger } from "ui/hooks/createTrigger";

type EventMap = Record<(string | number), any>;

type EventKey<T extends EventMap> = (string | number) & keyof T;
type EventReceiver<T> = (params: T) => void;

export class EventEmitter<E extends EventMap> {
    private l: { [K in keyof E]?: Array<(p: E[K]) => void> } = {};

    on<K extends EventKey<E>>(key: K, fn: EventReceiver<E[K]>) {
        let listeners = this.l[key];
        if(!listeners) {
            listeners = this.l[key] = [];
        }
        listeners.push(fn);
    }

    off<K extends EventKey<E>>(key: K, fn: EventReceiver<E[K]>) {
        this.l[key] = (this.l[key] || []).filter(f => f !== fn);
    }

    emit<K extends EventKey<E>>(key: K, data: E[K]) {
        batch(() => (this.l[key] || []).forEach((fn) => fn(data)));
    }

    mount<K extends EventKey<E>>(key: K, fn: EventReceiver<E[K]>) {
        onMount(() => {
            this.on(key, fn);
            onCleanup(() => this.off(key, fn));
        });
    }
}

interface EventSignal<T> {
    /** total number of listeners */
    t: number,
    /** count of listeners that have observed the item */
    c: number,
    /** current value, use an array for if T is falsey */
    v?: [T] | undefined,
    s: Trigger,
    /** After all listeners have been invoked, do this */
    a?: () => void,
}

export class ReactiveEventEmitter<E extends EventMap> {
    private e: { [K in keyof E]?: EventSignal<E[K]> } = {};

    /**
     * Within the current reactive scope, listen for the given event.
     *
     * The listener will be removed on cleanup.
     *
     * Do not call `emit` recursively within `on`.
     *
     * @param key The event key
     * @param fn The callback executing when the event happens
     * @param cond Optional conditional to only bind to the event when true, avoids unnecessary updates when false
     * */
    on<K extends EventKey<E>>(key: K, fn: EventReceiver<E[K]>, cond: Accessor<boolean> = () => true) {
        let signal = this.e[key]!, first = true, enabled = true;
        if(!signal) {
            signal = this.e[key] = { t: 0, c: 0, s: createTrigger() };
        }
        signal.t++; onCleanup(() => enabled && --signal.t);
        createComputed(() => {
            let was_enabled = enabled;
            if(cond() != enabled) {
                enabled = !enabled; // flip to match
                // put back in or take out of the total count
                signal.t += enabled ? 1 : -1;
            }

            if(enabled) {
                signal.s[0](); // track

                // skip first run, and ignore if it's just a cond() change
                if(!first && was_enabled) {
                    // take the values, then increment the counter
                    let value = signal.v, after = signal.a, last = ++signal.c >= signal.t;

                    try {
                        if(value) { fn(value[0]) } else if(__DEV__) {
                            console.warn("ReactiveEventEmitter listener received undefined value!");
                        }
                    } finally {
                        // free values, then run "after" callback
                        if(last) { signal.v = signal.a = undefined; after?.(); }
                    }
                }
            }

            first = false;
        });
    }

    /**
     * Returns true if there are any listeners for this event
     *
     * @param key the event key
     */
    has<K extends EventKey<E>>(key: K): boolean {
        return !!this.e[key]?.t;
    }

    /**
     * Trigger listeners for the given event.
     *
     * @throws if called within the listener callback
     *
     * @param key
     * @param value
     */
    emit<K extends EventKey<E>>(key: K, value: E[K], after?: () => void) {
        let signal = this.e[key];
        if(signal && signal.t) {
            if(__DEV__ && signal.c != 0 && signal.c < signal.t) {
                console.log(signal.c, signal.t);
                throw "Cannot emit event before all observers have been run!";
            }
            // setup
            signal.c = 0;
            signal.v = [value];
            signal.a = after;
            signal!.s[1](); // trigger
        }
    }
}

// export class ReactiveEventEmitter<E extends EventMap> {
//     signals: { [K in keyof EventMap]?: Signal<EventMap[K]> } = {};

//     on<K extends EventKey<E>>(key: K, fn: EventReceiver<E[K]>) {
//         createEffect(on((this.signals[key] ||= createSignal())[0], fn, { defer: true }));
//     }

//     set<K extends EventKey<E>>(key: K, data: E[K]) {
//         this.signals[key]?.[1](data);
//     }
// }