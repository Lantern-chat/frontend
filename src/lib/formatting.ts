const IEC_SUFFIXES: string[] = ["bytes", "KiB", "MiB", "GiB", "TiB", "PiB"];
//const SI_SUFFIXES: string[] = ["bytes", "KB", "MB", "GB", "TB", "PB"];
const UNITS: string[] = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte", "petabyte"];

function reduce(x: number, si: boolean = false): [ln2: number, value: number] {
    let i = 0, b = si ? 1000 : 1024;
    while(x >= b) {
        i++;
        x /= b;
    }
    return [i, x];
}

export function format_bytes_iec(x: number): string {
    let [i, y] = reduce(x);
    return y.toFixed(2) + ' ' + IEC_SUFFIXES[i];
}

export function createBytesFormatter(locale: string, si: boolean): (bytes: number) => string {
    if(!si) return format_bytes_iec;

    let units = UNITS.map((unit, i) => new Intl.NumberFormat(locale, {
        style: "unit",
        unit,
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
        unitDisplay: i == 0 ? "long" : "short",
    }));

    return (x: number) => {
        let [i, y] = reduce(x, true);
        return units[i].format(y);
    };
}