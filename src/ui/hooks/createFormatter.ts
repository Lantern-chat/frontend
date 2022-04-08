import { format_bytes } from "lib/formatting";
import { useLocale } from "ui/i18n";

export function createBytesFormatter(): (bytes: number) => string {
    let { locale, lang } = useLocale();

    return (bytes: number) => format_bytes(bytes, !lang().nsi, lang().d || locale());
}

export function createNumberFormatter(options: Intl.NumberFormatOptions): (value: number) => string {
    let { locale, lang } = useLocale();

    return (value: number) => new Intl.NumberFormat(lang().d || locale(), options).format(value);
}