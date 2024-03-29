import { batch } from "solid-js";

var max_t = Number.MAX_SAFE_INTEGER,
    pending: Set<() => void> = new Set(),
    last_t = max_t;

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
        if(timeout > 5) {
            setTimeout(run_pending, timeout);
        } else {
            queueMicrotask(run_pending);
        }
    } else if(__DEV__ && pending.size == 1) {
        alert("runBatched: This shouldn't happen");
    }

    return () => pending.delete(cb);
}