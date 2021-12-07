export function shallowEqualArrays<T>(arrA: T[] | null | undefined, arrB: T[] | null | undefined): boolean {
    if(arrA === arrB) {
        return true;
    }

    if(!arrA || !arrB) {
        return false;
    }

    let len = arrA.length;

    if(arrB.length !== len) {
        return false;
    }

    for(let i = 0; i < len; i++) {
        if(arrA[i] !== arrB[i]) {
            return false;
        }
    }

    return true;
}

export function shallowEqualObjects<T>(objA: T | null | undefined, objB: T | null | undefined): boolean {
    if(objA === objB) {
        return true;
    }

    if(!objA || !objB) {
        return false;
    }

    let aKeys = Object.keys(objA),
        bKeys = Object.keys(objB),
        len = aKeys.length;

    if(bKeys.length !== len) {
        return false;
    }

    for(let i = 0; i < len; i++) {
        let key = aKeys[i];

        if(objA[key] !== objB[key] || !Object.prototype.hasOwnProperty.call(objB, key)) {
            return false;
        }
    }

    return true;
}

/// NOTE: Use Intl.Collator for locale-aware comparisons
export function compareString(a: string, b: string): number {
    if(a < b) return -1;
    else if(a > b) return 1;
    else return 0;
}