import type { Translations } from '../i18n-types';

import 'dayjs/locale/en-gb';

import enUS from "../en-US";

const enGB: Translations = {
	...enUS as unknown as Translations,
	CALENDAR_FORMAT: {
		lastDay: "[Yesterday at] h:mm A",
		sameDay: "[Today at] h:mm A",
		nextDay: "[Tomorrow at] h:mm A",
		nextWeek: "dddd [at] h:mm A",
		lastWeek: "[Last] dddd [at] h:mm A",
		sameElse: 'DD/MM/YYYY'
	},
};

export default enGB;
