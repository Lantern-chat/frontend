import type { FormattersInitializer } from 'typesafe-i18n';
import type { Locales, Formatters } from './i18n-types';

import { number } from "typesafe-i18n/formatters";
import { LANGUAGES } from './';
import { format_bytes } from 'lib/formatting';

export const initFormatters: FormattersInitializer<Locales, Formatters> = (locale: Locales) => ({
	number: number(locale),
	decimal: number(locale, {
		maximumFractionDigits: 2,
		minimumFractionDigits: 2,
	}),
	integer: number(locale, {
		maximumFractionDigits: 0,
	}),
	bytes: (bytes: number): string => format_bytes(bytes, !LANGUAGES[locale].nsi, LANGUAGES[locale].d || locale) as string,
	percent: number(locale, {
		maximumFractionDigits: 2,
		style: 'unit',
		unit: 'percent'
	} as any),
});
