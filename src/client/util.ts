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