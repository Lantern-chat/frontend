
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

export function isDescendant(parent: HTMLElement, child: HTMLElement): boolean {
    var node = child.parentNode;
    while(node != null) {
        if(node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

export var visibilityChange: string | null;
var hidden: string | null, d = document as any;
if(typeof d.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
    hidden = "hidden";
    visibilityChange = "visibilitychange";
} else if(typeof d.msHidden !== "undefined") {
    hidden = "msHidden";
    visibilityChange = "msvisibilitychange";
} else if(typeof d.webkitHidden !== "undefined") {
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
} else {
    console.log("Page visibility API is not available!");
}

export function isPageHidden(): boolean {
    return hidden != null && d[hidden];
}