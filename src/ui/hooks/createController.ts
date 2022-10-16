import { Accessor, createMemo, createSignal, onCleanup } from "solid-js";
import { createTrigger } from "./createTrigger";

export type SetController<T> = (c: T | undefined) => void;

export function createController<T>(): [get: Accessor<T | undefined>, set: (c: T) => void] {
    let [get, set] = createSignal<T | undefined>();

    return [get, (value: T) => {
        set(value as any);
        onCleanup(() => set(undefined));
    }];
}