import * as Scheduler from 'scheduler';

const {
    unstable_scheduleCallback: scheduleCallback,
    unstable_IdlePriority: IdlePriority,
} = Scheduler;

export interface LRUOptions {
    limit: number,
}

// Based on https://github.com/facebook/react/blob/master/packages/react-cache/src/LRU.js
export interface LRUCache<T> {
    first: Entry<T> | null,
    size: number,
    options: LRUOptions,
    add: (value: T) => Entry<T>,
    remove: (entry: Entry<T>) => void,
    peek: (entry: Entry<T>) => (T | null),
    get: (entry: Entry<T>) => (T | null),
    cleanup: () => void,
    cleanupIsScheduled: boolean,
    maybeScheduleCleanup: () => void,
}

export interface Entry<T> {
    value: T | null,
    onDelete?: (value: T) => void,
    _previous: Entry<T> | null,
    _next: Entry<T> | null,
}

const DEFAULT_OPTIONS: LRUOptions = {
    limit: 500,
};

export default function createLRU<T>(options?: Partial<LRUOptions>): LRUCache<T> {
    let full_options = options ? { ...DEFAULT_OPTIONS, ...options } : DEFAULT_OPTIONS;

    let lru: LRUCache<T> = {
        first: null,
        size: 0,
        options: full_options,
        add,
        remove,
        peek,
        get,
        cleanup,
        cleanupIsScheduled: false,
        maybeScheduleCleanup,
    };

    function maybeScheduleCleanup() {
        if(lru.cleanupIsScheduled === false && lru.size > lru.options.limit) {
            lru.cleanupIsScheduled = true;

            scheduleCallback(IdlePriority, () => {
                if(lru.cleanupIsScheduled) {
                    lru.cleanup();
                }
            });
        }
    }

    function unsafeAppendToHead(entry: Entry<T>, head: Entry<T>) {
        const last = head._previous!
        last._next = entry;
        entry._previous = last;

        head._previous = entry;
        entry._next = lru.first;

        lru.first = entry;
    }

    function unsafeRemove(entry: Entry<T>) {
        const next = entry._next!;
        // Remove from current position first
        const previous = entry._previous!;
        previous._next = next;
        next._previous = previous;
    }

    function cleanup() {
        lru.cleanupIsScheduled = false;
        cleanup_to(lru.options.limit);
    }

    function cleanup_to(target: number) {
        if(lru.first !== null) {
            const resolvedFirst = lru.first;
            let last = resolvedFirst._previous;

            while(lru.size > target && last !== null) {
                const onDelete = last.onDelete;
                const value = last.value;
                const previous = last._previous;

                last.onDelete = undefined;
                last.value = null;

                // Remove from the list
                last._previous = last._next = null;
                if(last == lru.first) {
                    lru.first = last = null;
                } else {
                    lru.first!._previous = previous;
                    previous!._next = lru.first;
                    last = previous;
                }

                lru.size -= 1;

                if(onDelete != null) {
                    onDelete(value!);
                }
            }
        }
    }

    function add(value: T, onDelete?: (value: T) => void): Entry<T> {
        const entry: Entry<T> = {
            value, onDelete, _next: null, _previous: null
        };

        if(lru.first === null) {
            entry._previous = entry._next = entry;
            lru.first = entry;
        } else {
            unsafeAppendToHead(entry, lru.first);
        }

        lru.size += 1;

        lru.maybeScheduleCleanup();

        return entry;
    }

    function peek(entry: Entry<T>): T | null {
        return entry.value;
    }

    function remove(entry: Entry<T>) {
        if(entry._next !== null) {
            unsafeRemove(entry);
        }
    }

    function get(entry: Entry<T>): T | null {
        if(entry._next === null) {
            return null;
        }

        // move to head
        if(lru.first !== entry) {
            const resolvedFirst = lru.first!;

            unsafeRemove(entry);
            unsafeAppendToHead(entry, resolvedFirst)
        }

        return entry.value;
    }

    return lru;
}