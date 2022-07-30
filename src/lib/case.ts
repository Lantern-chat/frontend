export function capitalize(s: string): string {
    return s[0].toUpperCase() + s.slice(1);
}

export function to_pascal_case(s: string): string {
    return capitalize(s.replace(/([-_]\w)/g, m => capitalize(m.slice(1))));
}