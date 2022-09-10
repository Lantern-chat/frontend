import type { FormattersInitializer } from "typesafe-i18n";
import type { Locales, Formatters } from "./i18n-types";

import { date, number } from "typesafe-i18n/formatters";
import { LANGUAGES } from "./";
import { format_bytes } from "lib/formatting";

import type { BaseFormatters, FormatterFunction } from "typesafe-i18n/types/runtime/src/core.mjs";
import { calendar, DateParams } from "lib/time";
import { loadedLocales } from "./i18n-util";

export interface ExtendedFormatters extends Formatters, BaseFormatters {
	time: FormatterFunction<number | Date | undefined, string>,
	timestamp: FormatterFunction<number | Date | undefined, string>,
	calendar: FormatterFunction<number | Date | undefined, string> & ((t: DateParams, ref?: Date | number) => string),
}

const SUPPORTS_DATE_STYLE = (new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).resolvedOptions() as any).dateStyle === "full";

export const initFormatters: FormattersInitializer<Locales, ExtendedFormatters> = (locale: Locales) => {

	// resolve correct "real" locale
	let lang = LANGUAGES[locale], l = lang.d || locale;

	return {
		number: number(l),
		decimal: number(l, {
			maximumFractionDigits: 2,
			minimumFractionDigits: 2,
		}),
		integer: number(l, {
			maximumFractionDigits: 0,
		}),
		bytes: (bytes: number): string => format_bytes(bytes, !lang.nsi, l) as string,
		percent: number(l, {
			maximumFractionDigits: 2,
			style: "unit",
			unit: "percent"
		} as any),
		time: date(l, SUPPORTS_DATE_STYLE
			? { timeStyle: "short" }
			: { hour: "numeric", minute: "numeric" }),
		timestamp: date(l, SUPPORTS_DATE_STYLE
			? { dateStyle: "full", timeStyle: "short" }
			: { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric" }),
		calendar: (t: DateParams, ref?: Date | number) => calendar(l, t, loadedLocales[locale].CALENDAR_FORMAT, ref),
	} as any;
};
