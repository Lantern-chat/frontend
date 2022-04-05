import type { Translations } from '../i18n-types';

import 'dayjs/locale/en-gb';

import enUS from "../en-US";

const enGB: Translations = {
	...enUS as unknown as Translations,

	DEFAULT_TS_FORMAT: "dddd, MMMM Do, YYYY LT",
	CALENDAR_FORMAT: {
		lastDay: "[Yesterday at] LT",
		sameDay: "[Today at] LT",
		nextDay: "[Tomorrow at] LT",
		nextWeek: "dddd [at] LT",
		lastWeek: "[Last] dddd [at] LT",
		sameElse: 'L'
	},
};

export default enGB;
