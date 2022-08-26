import { format_bytes } from "lib/formatting";
import { useLocale } from "ui/i18n";

export function createBytesFormatter(l?: ReturnType<typeof useLocale>): (bytes: number) => string {
    let { locale, lang } = l ?? useLocale();
    return (bytes: number) => format_bytes(bytes, !lang().nsi, lang().d || locale());
}

export function createNumberFormatter(options: Intl.NumberFormatOptions, l?: ReturnType<typeof useLocale>): (value: number) => string {
    let { locale, lang } = l ?? useLocale();
    return (value: number) => new Intl.NumberFormat(lang().d || locale(), options).format(value);
}

export function createPercentFormatter(digits: number = 1, l?: ReturnType<typeof useLocale>): (value: number) => string {
    return createNumberFormatter({
        maximumFractionDigits: digits,
        style: 'percent'
    }, l);
}