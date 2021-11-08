export interface Ok<T> {
    ok: T,
}

export interface Err<E> {
    err: E,
}

export type Result<T, E = any> = { ok: T } | { err: E };

export function binarySearch<T, L extends (value: T) => number>(values: T[], compare: L): { idx: number, found: boolean } {
    let size = values.length, left = 0, right = size;
    while(left < right) {
        let mid = left + (size >> 1), // divide by 2
            rel = compare(values[mid]);

        if(rel < 0) {
            left = mid + 1;
        } else if(rel > 0) {
            right = mid;
        } else {
            return { idx: mid, found: true };
        }

        size = right - left;
    }

    return { idx: left, found: false };
}

export function countLines(str: string): number {
    return (str.match(/\n/g) || '').length + 1;
}

if(__TEST__) {
    describe("test", () => {

    })
}