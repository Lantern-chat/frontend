export function toCodePoints(s: string): number[] {
    return Array.from(s).map(x => x.codePointAt(0)!);
}
