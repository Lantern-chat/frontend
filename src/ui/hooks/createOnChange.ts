import { Accessor, createRenderEffect, on, onCleanup } from "solid-js";

export function createOnChange<T>(sig: Accessor<T>): () => Promise<T> {
    let listeners: Array<[resolve: (value: T) => void, reject: () => void]> = [];

    createRenderEffect(on(sig, value => {
        listeners.forEach(cb => cb[0](value));
        listeners = [];
    }));

    onCleanup(() => {
        listeners.forEach(cb => cb[1]());
        listeners = [];
    });

    return () => new Promise((resolve, reject) => listeners.push([resolve, reject]));
}

export function createOnPredicate<T>(sig: Accessor<T>, pred: (value: T) => boolean): () => Promise<T> {
    let on_change = createOnChange(sig);

    return async () => {
        let value; while(!pred(value = await on_change())) { }
        return value;
    };
}