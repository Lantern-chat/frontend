import type { FormattersInitializer } from "typesafe-i18n";
import type { Locales, Formatters } from "./i18n-types";

import { date, number } from "typesafe-i18n/formatters";
import { LANGUAGES } from "./";
import { format_bytes } from "lib/formatting";

import type { BaseFormatters, FormatterFunction } from "typesafe-i18n/types/runtime/src/core.mjs";

export interface ExtendedFormatters extends Formatters, BaseFormatters {
	time: FormatterFunction,
	timestamp: FormatterFunction,
}

const SUPPORTS_DATE_STYLE = (new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).resolvedOptions() as any).dateStyle === "full";

export const initFormatters: FormattersInitializer<Locales, ExtendedFormatters> = (locale: Locales) => ({
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
		style: "unit",
		unit: "percent"
	} as any),
	time: date(locale, SUPPORTS_DATE_STYLE
		? { timeStyle: "short" }
		: { hour: "numeric", minute: "numeric" }),
	timestamp: date(locale, SUPPORTS_DATE_STYLE
		? { dateStyle: "full", timeStyle: "short" }
		: { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric" }),
});
