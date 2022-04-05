const IEC_SUFFIXES: string[] = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
const SI_SUFFIXES: string[] = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
const UNIT: string[] = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte', 'petabyte'];

export function format_bytes(x: number, si: boolean, locale?: string): string {
    let i = 0, b = si ? 1000 : 1024;
    while(x >= b) {
        i++;
        x /= b;
    }

    if(locale && si) {
        return new Intl.NumberFormat(locale, <any>{
            style: 'unit',
            unit: UNIT[i],
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
            unitDisplay: i == 0 ? 'long' : 'short',
        }).format(x);
    }

    return x.toFixed(2) + ' ' + (si ? SI_SUFFIXES[i] : IEC_SUFFIXES[i]);
}