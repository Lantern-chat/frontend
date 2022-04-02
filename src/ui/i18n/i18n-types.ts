// This file was auto-generated by 'typesafe-i18n'. Any manual changes will be overwritten.
/* eslint-disable */
import type { BaseTranslation as BaseTranslationType, LocalizedString, RequiredParams } from 'typesafe-i18n'

export type BaseTranslation = BaseTranslationType & DisallowNamespaces
export type BaseLocale = 'en'

export type Locales =
	| 'en'
	| 'es'

export type Translation = RootTranslation & DisallowNamespaces

export type Translations = RootTranslation &
{
	main: NamespaceMainTranslation,
	settings: NamespaceSettingsTranslation
}

type RootTranslation = {
	/**
	 * This is a development build.
	 */
	DEV_BANNER: string
	/**
	 * Year
	 */
	YEAR: string
	/**
	 * Month
	 */
	MONTH: string
	/**
	 * Day
	 */
	DAY: string
	/**
	 * Register
	 */
	REGISTER: string
	/**
	 * Login
	 */
	LOGIN: string
	/**
	 * Email Address
	 */
	EMAIL_ADDRESS: string
	/**
	 * Username
	 */
	USERNAME: string
	/**
	 * Username or Email
	 */
	USERNAME_OR_EMAIL: string
	/**
	 * Nickname
	 */
	NICKNAME: string
	/**
	 * Password
	 */
	PASSWORD: string
	/**
	 * Reset
	 */
	RESET: string
	/**
	 * Date of Birth
	 */
	DATE_OF_BIRTH: string
	/**
	 * Network Error
	 */
	NETWORK_ERROR: string
	/**
	 * Unknown Error
	 */
	UNKNOWN_ERROR: string
	/**
	 * {h|{true: Don't have, false: Have}} a 2FA Code?
	 * @param {'false' | 'true'} h
	 */
	MFA_TOGGLE_TEXT: RequiredParams<`h|{true:${string}, false:${string}}`>
	/**
	 * Click here to {h|{true: hide, false: show}} the input.
	 * @param {'false' | 'true'} h
	 */
	MFA_TOGGLE_FLAVOR: RequiredParams<`h|{true:${string}, false:${string}}`>
	/**
	 * 2FA Code
	 */
	MFA_CODE: string
	/**
	 * Go to Login
	 */
	GOTO_LOGIN: string
	/**
	 * By registering, you agree to our... this will be filled in later.
	 */
	REGISTER_AGREE: string
	/**
	 * Password must be at least 8 characters long and contain at least one number or one special character.
	 */
	PASSWORD_REQS: string
	/**
	 * Change Theme
	 */
	CHANGE_THEME: string
	/**
	 * Change Theme Temperature
	 */
	CHANGE_THEME_TEMP: string
}

export type NamespaceMainTranslation = {
	/**
	 * Channel
	 */
	CHANNEL: string
	/**
	 * Party
	 */
	PARTY: string
	/**
	 * Direct Message
	 */
	DIRECT_MESSAGE: string
	/**
	 * Create Direct Message
	 */
	CREATE_DIRECT_MESSAGE: string
	/**
	 * Online
	 */
	ONLINE: string
	/**
	 * Offline
	 */
	OFFLINE: string
	/**
	 * Busy/Do Not Disturb
	 */
	BUSY: string
	/**
	 * Away
	 */
	AWAY: string
	/**
	 * Message
	 */
	MESSAGE: string
	/**
	 * Settings
	 */
	SETTINGS: string
	/**
	 * Mute
	 */
	MUTE: string
	/**
	 * Unmute
	 */
	UNMUTE: string
	/**
	 * Deafen
	 */
	DEAFEN: string
	/**
	 * Undeafen
	 */
	UNDEAFEN: string
	/**
	 * Edited
	 */
	EDITED: string
	/**
	 * Pinned
	 */
	PINNED: string
	/**
	 * Message Pinned
	 */
	MESSAGE_PINNED: string
	/**
	 * Click to reveal spoiler
	 */
	SPOILER_TITLE: string
	/**
	 * Owner
	 */
	OWNER: string
	/**
	 * You're viewing older messages.
	 */
	VIEWING_OLDER: string
	/**
	 * Go to now
	 */
	GOTO_NOW: string
}

export type NamespaceSettingsTranslation = {
	/**
	 * Account
	 */
	ACCOUNT: string
	/**
	 * Profile
	 */
	PROFILE: string
	/**
	 * Privacy
	 */
	PRIVACY: string
	/**
	 * Notifications
	 */
	NOTIFICATIONS: string
	/**
	 * Appearance
	 */
	APPEARANCE: string
	/**
	 * Accessibility
	 */
	ACCESSIBILITY: string
	/**
	 * Text & Media
	 */
	TEXT_AND_MEDIA: string
	/**
	 * Language
	 */
	LANGUAGE: string
	/**
	 * Logout
	 */
	LOGOUT: string
	/**
	 * Return
	 */
	RETURN: string
}

export type Namespaces =
	| 'main'
	| 'settings'

type DisallowNamespaces = {
	/**
	 * reserved for 'main'-namespace\
	 * you need to use the `./main/index.ts` file instead
	 */
	main?: "[typesafe-i18n] reserved for 'main'-namespace. You need to use the `./main/index.ts` file instead."

	/**
	 * reserved for 'settings'-namespace\
	 * you need to use the `./settings/index.ts` file instead
	 */
	settings?: "[typesafe-i18n] reserved for 'settings'-namespace. You need to use the `./settings/index.ts` file instead."
}

export type TranslationFunctions = {
	/**
	 * This is a development build.
	 */
	DEV_BANNER: () => LocalizedString
	/**
	 * Year
	 */
	YEAR: () => LocalizedString
	/**
	 * Month
	 */
	MONTH: () => LocalizedString
	/**
	 * Day
	 */
	DAY: () => LocalizedString
	/**
	 * Register
	 */
	REGISTER: () => LocalizedString
	/**
	 * Login
	 */
	LOGIN: () => LocalizedString
	/**
	 * Email Address
	 */
	EMAIL_ADDRESS: () => LocalizedString
	/**
	 * Username
	 */
	USERNAME: () => LocalizedString
	/**
	 * Username or Email
	 */
	USERNAME_OR_EMAIL: () => LocalizedString
	/**
	 * Nickname
	 */
	NICKNAME: () => LocalizedString
	/**
	 * Password
	 */
	PASSWORD: () => LocalizedString
	/**
	 * Reset
	 */
	RESET: () => LocalizedString
	/**
	 * Date of Birth
	 */
	DATE_OF_BIRTH: () => LocalizedString
	/**
	 * Network Error
	 */
	NETWORK_ERROR: () => LocalizedString
	/**
	 * Unknown Error
	 */
	UNKNOWN_ERROR: () => LocalizedString
	/**
	 * {h|{true: Don't have, false: Have}} a 2FA Code?
	 */
	MFA_TOGGLE_TEXT: (arg: { h: 'false' | 'true' }) => LocalizedString
	/**
	 * Click here to {h|{true: hide, false: show}} the input.
	 */
	MFA_TOGGLE_FLAVOR: (arg: { h: 'false' | 'true' }) => LocalizedString
	/**
	 * 2FA Code
	 */
	MFA_CODE: () => LocalizedString
	/**
	 * Go to Login
	 */
	GOTO_LOGIN: () => LocalizedString
	/**
	 * By registering, you agree to our... this will be filled in later.
	 */
	REGISTER_AGREE: () => LocalizedString
	/**
	 * Password must be at least 8 characters long and contain at least one number or one special character.
	 */
	PASSWORD_REQS: () => LocalizedString
	/**
	 * Change Theme
	 */
	CHANGE_THEME: () => LocalizedString
	/**
	 * Change Theme Temperature
	 */
	CHANGE_THEME_TEMP: () => LocalizedString
	main: {
		/**
		 * Channel
		 */
		CHANNEL: () => LocalizedString
		/**
		 * Party
		 */
		PARTY: () => LocalizedString
		/**
		 * Direct Message
		 */
		DIRECT_MESSAGE: () => LocalizedString
		/**
		 * Create Direct Message
		 */
		CREATE_DIRECT_MESSAGE: () => LocalizedString
		/**
		 * Online
		 */
		ONLINE: () => LocalizedString
		/**
		 * Offline
		 */
		OFFLINE: () => LocalizedString
		/**
		 * Busy/Do Not Disturb
		 */
		BUSY: () => LocalizedString
		/**
		 * Away
		 */
		AWAY: () => LocalizedString
		/**
		 * Message
		 */
		MESSAGE: () => LocalizedString
		/**
		 * Settings
		 */
		SETTINGS: () => LocalizedString
		/**
		 * Mute
		 */
		MUTE: () => LocalizedString
		/**
		 * Unmute
		 */
		UNMUTE: () => LocalizedString
		/**
		 * Deafen
		 */
		DEAFEN: () => LocalizedString
		/**
		 * Undeafen
		 */
		UNDEAFEN: () => LocalizedString
		/**
		 * Edited
		 */
		EDITED: () => LocalizedString
		/**
		 * Pinned
		 */
		PINNED: () => LocalizedString
		/**
		 * Message Pinned
		 */
		MESSAGE_PINNED: () => LocalizedString
		/**
		 * Click to reveal spoiler
		 */
		SPOILER_TITLE: () => LocalizedString
		/**
		 * Owner
		 */
		OWNER: () => LocalizedString
		/**
		 * You're viewing older messages.
		 */
		VIEWING_OLDER: () => LocalizedString
		/**
		 * Go to now
		 */
		GOTO_NOW: () => LocalizedString
	}
	settings: {
		/**
		 * Account
		 */
		ACCOUNT: () => LocalizedString
		/**
		 * Profile
		 */
		PROFILE: () => LocalizedString
		/**
		 * Privacy
		 */
		PRIVACY: () => LocalizedString
		/**
		 * Notifications
		 */
		NOTIFICATIONS: () => LocalizedString
		/**
		 * Appearance
		 */
		APPEARANCE: () => LocalizedString
		/**
		 * Accessibility
		 */
		ACCESSIBILITY: () => LocalizedString
		/**
		 * Text & Media
		 */
		TEXT_AND_MEDIA: () => LocalizedString
		/**
		 * Language
		 */
		LANGUAGE: () => LocalizedString
		/**
		 * Logout
		 */
		LOGOUT: () => LocalizedString
		/**
		 * Return
		 */
		RETURN: () => LocalizedString
	}
}

export type Formatters = {}
