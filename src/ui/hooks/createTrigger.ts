import { createSignal } from "solid-js";

export type Fn<R = void> = () => R;
export type Trigger = [track: Fn, dirty: Fn];

export function createTrigger(): Trigger {
    return createSignal(undefined, { equals: false });
}