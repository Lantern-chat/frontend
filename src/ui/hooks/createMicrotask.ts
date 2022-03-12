export function createMicrotask<A extends any[] | []>(fn: (...a: A) => void): (...a: A) => void {
    let calls = 0;
    let args: A;
    return (...a: A) => {
        (args = a), calls++;
        queueMicrotask(() => --calls === 0 && fn(...args));
    };
}