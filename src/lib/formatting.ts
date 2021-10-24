const SUFFIXES: string[] = ['B', 'KiB', 'MiB', 'GiB', 'TiB'];

export function format_bytes(x: number): string {
    let i = 0;
    while(x >= 1024) {
        i++;
        x /= 1024;
    }

    return x.toFixed(2) + ' ' + SUFFIXES[i];
}