const IEC_SUFFIXES: string[] = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
const SI_SUFFIXES: string[] = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

export function format_bytes(x: number, si?: boolean): string {
    let i = 0, b = si ? 1000 : 1024;
    while(x >= b) {
        i++;
        x /= b;
    }

    return x.toFixed(2) + ' ' + (si ? SI_SUFFIXES[i] : IEC_SUFFIXES[i]);
}