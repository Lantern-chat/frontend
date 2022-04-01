import type { BaseTranslation } from '../i18n-types';

import 'dayjs/locale/en';

export default {
	CHANNEL: "Channel",
	PARTY: "Party",
	DIRECT_MESSAGE: "Direct Message",
	CREATE_DIRECT_MESSAGE: "Create Direct Message",
	YEAR: "Year",
	MONTH: "Month",
	DAY: "Day",
	MONTHS: "January,February,March,April,May,June,July,August,September,October,November,December",
	REGISTER: "Register",
	LOGIN: "Login",
	EMAIL_ADDRESS: "Email Address",
	USERNAME: "Username",
	USERNAME_OR_EMAIL: "Username or Email",
	NICKNAME: "Nickname",
	PASSWORD: "Password",
	RESET: "Reset",
	DATE_OF_BIRTH: "Date of Birth",
	NETWORK_ERROR: "Network Error",
	UNKNOWN_ERROR: "Unknown Error",
	MFA_TOGGLE_TEXT: "{h|{true: Don't have, false: Have}} a 2FA Code?",
	MFA_TOGGLE_FLAVOR: "Click here to {h|{true: hide, false: show}} the input.",
	MFA_CODE: "2FA Code",
} as BaseTranslation;
