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
    Pending = 0,
    Success,
    Error,
}

// TODO: Improve?
export function wrapPromise<T>(promise: Promise<T>) {
    let status = Res.Pending;
    let result: any;
    let suspender = promise.then(
        r => {
            status = Res.Success;
            result = r;
        },
        e => {
            status = Res.Error;
            result = e;
        }
    );
    return {
        read(): T {
            switch(status) {
                case Res.Pending: throw suspender;
                case Res.Error: throw result;
                case Res.Success: return result;
            }
        }
    };
}
