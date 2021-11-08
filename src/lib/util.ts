interface CancellablePromise<T> extends Promise<T> {
    cancel(): void;
}

export function delay(ms: number): CancellablePromise<void> {
    var tmp: { onCancel?: () => void } = {};
    let promise = <CancellablePromise<void>>new Promise((resolve, reject) => {
        let timeout = window.setTimeout(() => resolve(), ms);
        tmp.onCancel = () => { window.clearTimeout(timeout); reject(); };
    });

    promise.cancel = () => tmp.onCancel!();

    return promise;
}

export function timeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
        let completed = false;

        promise.then((value) => {
            if(!completed) {
                completed = true;
                resolve(value);
            }
        });

        setTimeout(() => {
            if(!completed) {
                completed = true;
                reject();
            }
        }, ms);
    })
}

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

