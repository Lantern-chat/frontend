import { createSignal } from "solid-js";

export type Fn<R = void> = () => R;

/**
 * `track` will register the signal to be tracked in that position.
 * `dirty` will trigger the signal to update, invoking any tracked paths.
 */
export type Trigger = [track: Fn, dirty: Fn];

/**
 * Creates a signal used for tracking any change without state.
 *
 * @returns Trigger
 */
export function createTrigger(): Trigger {
    return createSignal(undefined, { equals: false });
}