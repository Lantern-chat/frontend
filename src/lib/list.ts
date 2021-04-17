import { List, foldl } from "list";

export function map_to_array<T, U>(list: List<T>, mapper: (value: T) => U): U[] {
    let idx = 0;
    return foldl((acc, value) => {
        acc[idx++] = mapper(value);
        return acc;
    }, new Array(list.length), list);
}