export function validateUsername(value: string): boolean {
    return /^[^\s].{1,62}[^\s]$/u.test(value);
}

export function validateEmail(value: string): boolean {
    return value.length <= 320 && /^[^@\s]{1,64}@[^@\s]+\.[^.@\s]+$/.test(value);
}

export function validatePass(value: string): boolean {
    // TODO: Set this with server-side options
    return value.length >= 8 && /[^\p{L}]|\p{N}/u.test(value);
}
