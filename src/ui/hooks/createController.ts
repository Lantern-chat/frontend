import { Accessor, createMemo, onCleanup } from "solid-js";
import { createTrigger } from "./createTrigger";

export type SetController<T> = (c: T | null) => void;

export function createController<T>(): [get: Accessor<T | null>, set: (c: T) => void] {
    let storage: { c: null | T } = { c: null },
        [track, dirty] = createTrigger(),
        counter = 0;

    return [() => (track(), storage.c), (value: T) => {
        // same trick as `createRef`, only trigger cleanup on last usage
        counter++; onCleanup(() => --counter || (storage.c = null, dirty()));

        return (storage.c = value, dirty(), value);
    }];
}