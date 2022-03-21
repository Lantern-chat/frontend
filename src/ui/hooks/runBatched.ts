import { batch } from "solid-js";

let pending: Set<() => void> = new Set();

function run_pending() {
    if(pending.size) {
        __DEV__ && console.log("Batching", pending.size);

        batch(() => pending.forEach(cb => cb()));
        pending.clear();
    }
}

export type CancelBatched = () => boolean;

export function runBatched(cb: () => void, timeout: number = 5): CancelBatched {
    pending.add(cb);

    let t = setTimeout(() => run_pending(), timeout);

    return () => { clearTimeout(t); return pending.delete(cb); };
}