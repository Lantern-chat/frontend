export function merge<T, K extends keyof T>(obj: T, key: K, value: T[K]): T[K] {
    return obj[key] ? Object.assign(obj[key], value) : (obj[key] = value);
}