export type CanBeEmpty<T> = {} extends T ? T : never;
export function erase<T>(obj: CanBeEmpty<T>) {
    for(let key in obj) {
        delete obj[key];
    }
}
export function eraseKeys<T, K extends keyof T>(obj: CanBeEmpty<Pick<T, K>>, keys: K[]) {
    for(let key of keys) {
        delete obj[key];
    }
}

export function split<T>(values: Array<T>, pred: (a: T) => boolean): [Array<T>, Array<T>] {
    let t: Array<T> = [], f: Array<T> = [];
    for(let value of values) { (pred(value) ? t : f).push(value); }
    return [t, f];
}

export function countLines(str: string): number {
    return (str.match(/\n/g) || '').length + 1;
}

export interface Ok<T> { ok: T }
export interface Err<E> { err: E }
export type Result<T, E = any> = Ok<T> | Err<E>;

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

function swap<T>(arr: Array<T>, left: number, right: number) {
    let tmp = arr[left];
    arr[left] = arr[right];
    arr[right] = tmp;
}

export function shuffle(array: Array<any>) {
    let m = array.length;
    while(m) {
        swap(array, Math.floor(Math.random() * m--), m);
    }
}

/*
type CompareFunc<T> = (a: T, b: T) => number;

function less_than<T>(a: T, b: T): number {
    return a < b ? -1 : 1;
}

function quicksort_inner<T>(arr: Array<T>, first: number, last: number, cmp: CompareFunc<T>) {
    if(first < last) {
        let pivot = arr[first + ((last - first) >> 1)],
            left = first, right = last;

        do {
            while(cmp(arr[left], pivot) < 0) {
                left++;
            }

            while(cmp(pivot, arr[right]) < 0) {
                right--;
            }

            if(left <= right) {
                let t = arr[left];
                arr[left++] = arr[right];
                arr[right--] = t;
            }
        } while(left <= right);

        quicksort_inner(arr, first, right, cmp);
        quicksort_inner(arr, left, last, cmp);
    }
}

export function quicksort<T>(arr: Array<T>, cmp: CompareFunc<T> = less_than) {
    quicksort_inner(arr, 0, arr.length - 1, cmp);
}
*/

export function lazy<T>(gen: () => T): () => T {
    let value: T | undefined;
    return () => {
        if(!value) {
            value = gen();
        }
        return value;
    };
}