declare var __DEV__: boolean;
declare var __PRERELEASE__: boolean;
declare var __TEST__: boolean;

interface String {
    trimStart(): string;
    trimEnd(): string;
    padEnd(targetLength: number, padString?: string): string;
    padStart(targetLength: number, padString?: string): string;
}

interface Array<T> {
    includes(item: T): boolean;
}

declare type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;