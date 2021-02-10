export function makeGeneric(name: string, payload?: any) {
    return { type: name, payload };
}