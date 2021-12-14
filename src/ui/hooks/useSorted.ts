import { useMemo } from "react";

/// Memoizes the sorting of an array
export function useSorted<T>(value: Array<T>, cmp: (a: T, b: T) => number, deps: any[] = value): Array<T> {
    return useMemo(() => {
        let sorted = value.slice();
        sorted.sort(cmp);
        return sorted;
    }, deps);
}