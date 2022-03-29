import { Accessor, createRenderEffect, createSignal, untrack } from "solid-js";

/// Signal latch that only turns to true
export function createLatch(signal: Accessor<boolean>): Accessor<boolean> {
    let [latch, setLatch] = createSignal(false);
    createRenderEffect(() => untrack(() => latch()) || setLatch(signal()));
    return latch;
}