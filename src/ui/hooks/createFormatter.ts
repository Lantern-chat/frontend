import { format_bytes } from "lib/formatting";
import { useLocale } from "ui/i18n";

export function createBytesFormatter(): (bytes: number) => string {
    let { locale, lang } = useLocale();
    return (bytes: number) => format_bytes(bytes, !lang().nsi, lang().d || locale());
}

export function createNumberFormatterInner(props: ReturnType<typeof useLocale>, options: Intl.NumberFormatOptions): (value: number) => string {
    return (value: number) => new Intl.NumberFormat(props.lang().d || props.locale(), options).format(value);
}

export function createNumberFormatter(options: Intl.NumberFormatOptions): (value: number) => string {
    return createNumberFormatterInner(useLocale(), options);
}

export function createPercentFormatter(digits: number = 1): (value: number) => string {
    return createNumberFormatter({
        maximumFractionDigits: digits,
        style: 'percent'
    });
}

export function createFixedPercentFormatter(): (value: number) => string {
    let locale = useLocale(),
        zero = createNumberFormatterInner(locale, {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2,
            style: 'percent',
        }),
        z99 = createNumberFormatterInner(locale, {
            maximumFractionDigits: 1,
            minimumFractionDigits: 1,
            style: 'percent',
        }),
        one = createNumberFormatterInner(locale, {
            maximumFractionDigits: 0,
            style: 'percent',
        });

    return (value: number) => {
        if(value < 0.01) {
            return zero(value);
        } else if(value < 0.995) {
            return z99(value);
        } else {
            return one(value);
        }
    };
}