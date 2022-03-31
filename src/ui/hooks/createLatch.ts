import { Accessor, createMemo } from "solid-js";

export function createLatch(signal: Accessor<boolean>): Accessor<boolean> {
    return createMemo(value => value || signal(), false);
}

export function createInvertedLatch(signal: Accessor<boolean>): Accessor<boolean> {
    return createMemo(value => value && signal(), true);
}