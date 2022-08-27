export const toCodePoints = (s: string): number[] =>
    Array.from(s).map(x => x.codePointAt(0)!);

export const toHexCodePoints = (s: string, sep: string = '-'): string =>
    Array.from(s).map(x => x.codePointAt(0)!.toString(16)).join(sep);