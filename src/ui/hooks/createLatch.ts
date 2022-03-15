import { Accessor, createRenderEffect, createSignal } from "solid-js";

export function createLatch(signal: Accessor<boolean>): Accessor<boolean> {
    let [latch, setLatch] = createSignal(false);
    createRenderEffect(() => setLatch(latch() || signal()));
    return latch;
}