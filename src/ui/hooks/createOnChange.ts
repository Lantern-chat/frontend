import { Accessor, createRenderEffect, on } from "solid-js";

export function createOnChange<T>(sig: Accessor<T>): () => Promise<T> {
    let listeners: Array<(value: T) => void> = [];

    createRenderEffect(on(sig, value => {
        listeners.forEach(cb => cb(value));
        listeners = [];
    }));

    return () => new Promise(resolve => listeners.push(resolve));
}

export function createOnPredicate<T>(sig: Accessor<T>, pred: (value: T) => boolean): () => Promise<T> {
    let on_change = createOnChange(sig);

    return async () => {
        let value; while(!pred(value = await on_change())) { }
        return value;
    };
}