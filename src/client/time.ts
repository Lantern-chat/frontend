import * as dayjs from "dayjs";

import utc from "dayjs/plugin/utc";
dayjs.extend(utc);

import advancedFormat from "dayjs/plugin/advancedFormat";
dayjs.extend(advancedFormat);

import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

import localeData from 'dayjs/plugin/localeData';
dayjs.extend(localeData);

export default dayjs;