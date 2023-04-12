import { shallowEqualArrays } from "lib/compare";
import { Accessor, createMemo } from "solid-js";

export function createArrayMemo<T>(arr: T[] | Accessor<T[]>, cmp?: (a: T, b: T) => number): Accessor<T[]> {
    if(typeof arr !== "function") {
        return () => arr;
    }

    let equals: (a: T[], b: T[]) => boolean =
        cmp ? (a: T[], b: T[]) => shallowEqualArrays(a, b, (k, j) => 0 == cmp(k, j)) : shallowEqualArrays;

    return createMemo(arr, void 0, { equals });
}
