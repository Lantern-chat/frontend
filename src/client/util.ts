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

enum Res {
    PENDING,
    SUCCESS,
    ERROR,
}

// TODO: Improve?
export function wrapPromise<T>(promise: Promise<T>) {
    let status = Res.PENDING;
    let result: any;
    let suspender = promise.then(
        r => {
            status = Res.SUCCESS;
            result = r;
        },
        e => {
            status = Res.ERROR;
            result = e;
        }
    );
    return {
        read(): T {
            switch(status) {
                case Res.PENDING: throw suspender;
                case Res.ERROR: throw result;
                case Res.SUCCESS: return result;
            }
        }
    };
}
