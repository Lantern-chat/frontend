import { Accessor, createMemo, onCleanup } from "solid-js";
import { createTrigger } from "./createTrigger";

export type SetController<T> = (c: T | null) => void;

export function createController<T>(): [get: Accessor<T | null>, set: (c: T) => void] {
    let storage: { c: null | T } = { c: null };
    let [track, dirty] = createTrigger();

    let get = createMemo(() => {
        track();
        return storage.c;
    });

    let counter = 0, set = (value: T) => {
        storage.c = value;
        dirty();

        // same trick as `createRef`, only trigger cleanup on last usage
        counter++; onCleanup(() => --counter || (storage.c = null, dirty()));

        return value;
    };

    return [get, set];
}