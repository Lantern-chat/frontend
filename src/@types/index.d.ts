declare var __DEV__: boolean;
declare var __PRERELEASE__: boolean;

interface String {
    trimStart(): string;
    trimEnd(): string;
    padEnd(targetLength: number, padString?: string): string;
    padStart(targetLength: number, padString?: string): string;
}