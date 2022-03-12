/// SolidJS Store/Proxy-friendly Maps and Sets using regular objects and arrays

import { binarySearch, erase } from "lib/util";

export type Key = keyof any;

export interface ObjectMap<K extends Key, V> {
    has(key: K): boolean;
    set(key: K, value: V): void;
    get(key: K): V | undefined;
    delete(key: K): void;
    values(): Array<V>;
    keys(): Array<string>;
    clear(): void;
    forEach(cb: (value: V, key: K, map: ObjectMap<K, V>) => void): void;
    size: number;
    inner: Record<K, V>,
}

export function ObjectMap<K extends Key, V>(map: Record<K, V> = {} as Record<K, V>): ObjectMap<K, V> {
    let size: number, dirty = true;
    return {
        inner: map,
        has(key) { return !!map[key]; },
        set(key, value) { map[key] = value; dirty = true; },
        get(key) { return map[key]; },
        delete(key) { delete map[key]; dirty = true; },
        values() { return Object.values(map); },
        keys() { return Object.keys(map); },
        clear() { erase(map as {}); dirty = true; },
        forEach(cb: (value: V, key: K, map: ObjectMap<K, V>) => void) {
            for(let key in map) { cb(map[key], key, this); }
        },
        get size() {
            if(dirty) {
                size = 0;
                for(let _key in map) { size++; }
                dirty = false;
            }
            return size;
        },
    };
}

export interface ArraySet<K> {
    has(value: K): boolean;
    add(value: K): void;
    delete(value: K): void;
    clear(): void;
    values(): Array<K>;
    forEach(cb: (value: K, key: K, set: ArraySet<K>) => void): void;
    size: number,
    inner: Array<K>,
}

export type OrderedKey = number | string;

export function ArraySet<K extends OrderedKey>(set: Array<K> = []): ArraySet<K> {
    // TODO: Determine if we should `set.slice()` to improve performance with proxies
    let search = typeof set[0] === 'number'
        ? (v: K) => binarySearch(set, t => (t as number) - (v as number))
        : (v: K) => binarySearch(set, t => v == t ? 0 : (v < t ? 1 : -1));

    return {
        inner: set,
        has(value) { return search(value).found; },
        add(value) {
            let { idx, found } = search(value);
            if(!found) {
                set.splice(idx, 0, value);
            }
        },
        delete(value) {
            let { idx, found } = search(value);
            if(found) { set.splice(idx, 1); }
        },
        clear() { set.splice(0, set.length); },
        values() { return set; },
        forEach(cb: (value: K, key: K, set: ArraySet<K>) => void) {
            set.forEach(value => cb(value, value, this));
        },
        get size() { return set.length; },
    }
}