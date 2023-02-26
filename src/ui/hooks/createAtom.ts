import type { Accessor, Setter } from "solid-js";
import { createSignal } from "solid-js";

export type Atom<T> = Accessor<T> & Setter<T>;

export function createAtom<T>(): Atom<T | undefined>;
export function createAtom<T>(initial: T): Atom<T>;

export function createAtom<T>(initial?: T): Atom<T> {
    let [value, setValue] = createSignal(initial);
    return (...args: any[]): any => args.length ? setValue(args[0]) : value();
}