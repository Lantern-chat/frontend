export function copyText(txt: string): Promise<void> {
    return navigator.clipboard.writeText(txt);
}
