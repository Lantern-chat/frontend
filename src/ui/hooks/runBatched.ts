import { batch } from "solid-js";

var max_t = Number.MAX_SAFE_INTEGER;
var pending: Set<() => void> = new Set();
var last_t = max_t;

function run_pending() {
    if(pending.size) {
        __DEV__ && console.log("Batching", pending.size);

        batch(() => pending.forEach(cb => cb()));

        pending.clear();
        last_t = max_t;
    }
}

export type CancelBatched = () => boolean;

export function runBatched(cb: () => void, timeout: number = 5): CancelBatched {
    pending.add(cb);

    if(timeout < last_t) {
        last_t = timeout;
        setTimeout(() => run_pending(), timeout);
    } else if(__DEV__ && pending.size == 1) {
        alert("runBatched: This shouldn't happen");
    }

    return () => { return pending.delete(cb); };
}