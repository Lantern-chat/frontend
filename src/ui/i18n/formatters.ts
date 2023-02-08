import type { FormattersInitializer } from "typesafe-i18n";
import type { Locales, Formatters } from "./i18n-types";

import { date, number } from "typesafe-i18n/formatters";
import { LANGUAGES } from "./";
import { createBytesFormatter, format_bytes_iec } from "lib/formatting";

import type { BaseFormatters, FormatterFunction } from "typesafe-i18n/types/runtime/src/core.mjs";
import { calendar, DateParams, relative } from "lib/time";
import { loadedLocales } from "./i18n-util";

export interface ExtendedFormatters extends Formatters, BaseFormatters {
	time: FormatterFunction<number | Date | undefined, string>,
	date: FormatterFunction<number | Date | undefined, string>,
	timestamp: FormatterFunction<number | Date | undefined, string>,
	calendar: FormatterFunction<number | Date | undefined, string> & ((t: DateParams, ref?: Date | number) => string),
	relative: FormatterFunction<number, string>,
	/// Percent with zero decimals
	percent0: Formatters['percent'],
	bytes: FormatterFunction<number, string>,
}

const SUPPORTS_DATE_STYLE = (new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).resolvedOptions() as any).dateStyle === "full";

export const initFormatters: FormattersInitializer<Locales, ExtendedFormatters> = (locale: Locales) => {
	// resolve correct "real" locale
	let lang = LANGUAGES[locale], l = lang.d || locale;
	let rel = new Intl.RelativeTimeFormat(locale);

	return {
		number: number(l),
		decimal: number(l, {
			maximumFractionDigits: 2,
			minimumFractionDigits: 2,
		}),
		integer: number(l, {
			maximumFractionDigits: 0,
		}),
		bytes: createBytesFormatter(l, !lang.nsi),
		percent: number(l, {
			maximumFractionDigits: 2,
			style: "percent"
		}),
		percent0: number(l, {
			maximumFractionDigits: 0,
			style: "percent"
		}),
		time: date(l, SUPPORTS_DATE_STYLE
			? { timeStyle: "short" }
			: { hour: "numeric", minute: "numeric" }),
		date: date(l, SUPPORTS_DATE_STYLE ? { dateStyle: "long" } : { month: "long", day: "numeric", year: "numeric" }),
		timestamp: date(l, SUPPORTS_DATE_STYLE
			? { dateStyle: "full", timeStyle: "short" }
			: { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric" }),
		calendar: (t: DateParams, ref?: Date | number) => calendar(l, t, loadedLocales[locale].CALENDAR_FORMAT, ref),
		relative: (duration: number) => relative(rel, duration),
	} as any;
};