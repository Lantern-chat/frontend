import type { BaseTranslation } from '../i18n-types';

import 'dayjs/locale/en';

// @stringify
const en: BaseTranslation = {
	DEV_BANNER: "This is a development build.",
	YEAR: "Year",
	MONTH: "Month",
	DAY: "Day",
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
	GOTO_LOGIN: "Go to Login",
	REGISTER_AGREE: "By registering, you agree to our... this will be filled in later.",
	PASSWORD_REQS: "Password must be at least 8 characters long and contain at least one number or one special character.",
	CHANGE_THEME: "Change Theme",
	CHANGE_THEME_TEMP: "Change Theme Temperature"
};

export default en;
