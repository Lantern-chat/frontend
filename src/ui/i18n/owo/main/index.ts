import type { NamespaceMainTranslation } from '../../i18n-types'

const owo_main: NamespaceMainTranslation = {
	CHANNEL: "channew >_<",
	PARTY: "pawty rawr x3",
	DIRECT_MESSAGE: "diwect message, mya",
	CREATE_DIRECT_MESSAGE: "cweate d-diwect m-message, nyaa~~",
	BOT: "{{verified:✔|}} OwO",
	ONLINE: "onwine (⑅˘꒳˘)",
	OFFLINE: "offwine rawr x3",
	BUSY: "busy/do nyot distuwb (✿oωo)",
	AWAY: "away",
	MESSAGE: "message (ˆ ﻌ ˆ)♡",
	SETTINGS: "settings (˘ω˘)",
	MUTE: "mute (⑅˘꒳˘)",
	UNMUTE: "unmute (///ˬ///✿)",
	DEAFEN: "deafen 😳😳😳",
	UNDEAFEN: "undeafen 🥺",
	EDITED: "edited, mya",
	EDITED_ON: "editwed on {ts|timestamp}, nyaa!",
	PINNED: "pinned 😳",
	MESSAGE_PINNED: "message pinned >_<",
	SPOILER_TITLE: "cwick t-to weveaw spoiwew >_<",
	OWNER: "ownew (⑅˘꒳˘)",
	VIEWING_OLDER: "you'we v-viewing owdew messages. /(^•ω•^)",
	GOTO_NOW: "go to nyow, rawr x3",
	USERS_TYPING: [
		"{0} ish typing, nyaa~~", // 1 user
		"{0} and {1} awe typing, ʘwʘ", // 2 users
		"{0}, {1}, and {2} awe typing :3", // 3 users
		"{0}, {1}, {2}, and {3} othews awe typing /(^•ω•^)", // 4+ users, parameter 3 is a number
	],
	channel: {
		TOP1: "You have weached the top of #{0}! OwO",
		TOP2: "Congwats on making it this faw ^_^."
	},
	menus: {
		COPY_ID: "copy i-id (⑅˘꒳˘)",
		MARK_AS_READ: "mawk as wead nyaa~~",
		INVITE_PEOPLE: "invite p-peopwe OwO",
		msg: {
			DELETE: "dewete message rawr x3",
			CONFIRM: "awe you s-suwe?",
			EDIT: "edit m-message XD",
			COPY: "copy m-message σωσ",
			COPY_SEL: "copy sewection (U ᵕ U❁)",
			REPORT: "wepowt message (U ﹏ U)",
		},
		room: {
			EDIT: "edit channew :3",
		},
		room_list: {
			CREATE: "cweate channew σωσ",
		}
	},
	member_list: {
		ROLE: "{role} – {length|number}",
	},
	lightbox: {
		META: " — {width|number} x {height|number} ({size|bytes})",
	},
	settings: {
		ACCOUNT: "account (U ﹏ U)",
		PROFILE: "pwofiwe (U ﹏ U)",
		PRIVACY: "pwivacy (⑅˘꒳˘)",
		NOTIFICATIONS: "notifications òωó",
		APPEARANCE: "appeawance ʘwʘ",
		ACCESSIBILITY: "accessibiwity /(^•ω•^)",
		TEXT_AND_MEDIA: "text & media ʘwʘ",
		LANGUAGE: "wanguage σωσ",
		LOGOUT: "wogout OwO",
		RETURN: "wetuwn 😳😳😳",
		SELECT_CATEGORY: "Sewect any categowy to view settings (⑅˘꒳˘)",
		account: {
			QUOTA: "{used|bytes}/{total|bytes} ({percent|percent}) u-upwoad quota used, rawr",
			DEV_MODE: "Eenabwe D-devewopew Mode",
		},
		appearance: {
			THEME: "Theme, (˘ω˘)",
			GROUP_LINES: "show wines between gwoups, nyaa~~",
			GROUP_PADDING: "gwoup padding, UwU",
			LIGHT_THEME: "wight theme, :3",
			DARK_THEME: "dawk t-theme, (⑅˘꒳˘)",
			OLED_THEME: "enabwe o-owed dawk theme (///ˬ///✿)",
			TEMP: "tempewatuwe ^^;;",
			VIEW_MODE: "view mode >_<",
			COMPACT: "compact",
			COZY: "cozy, rawr x3",
			FONT_EXAMPLE: "\"the wizawd quickwy jinxed the gnomes b-befowe they vapowized, /(^•ω•^).\"",
			CHAT_FONT_SIZE: "chat font size :3",
			UI_FONT_SIZE: "ui f-font size (ꈍᴗꈍ)",
			CHAT_FONT_FAMILY: "chat font famiwy /(^•ω•^)",
			UI_FONT_FAMILY: "ui font famiwy (⑅˘꒳˘)",
		},
		notifications: {
			ENABLE_DESKTOP_NOTIFICATIONS: [
				"enabwe desktop nyotifications ( ͡o ω ͡o )",
				"enabwe desktop n-nyotifications (may be outdated i-if wevoked e-extewnawwy) òωó",
				"enabwe d-desktop nyotifications (not a-avaiwabwe) (⑅˘꒳˘)",
			]
		},
		media: {
			MUTE_MEDIA: "mute m-media b-by defauwt XD",
			HIDE_UNKNOWN: "disabwe attachments o-of unknown s-size",
			USE_PLATFORM_EMOJIS: "use p-pwatfowm emojis -.-",
			ENABLE_SPELLCHECK: "enabwe s-spewwcheck"
		},
		accessibility: {
			REDUCE_MOTION: "weduce motion, nyaa~~",
			UNFOCUS_PAUSE: "pause g-gifs on unfocus 😳",
			LOW_BANDWIDTH: "enyabwe woew-bandwidth mode",
		}
	},
	system: {
		welcome: [
			"wewcome (ꈍᴗꈍ) <@{user}>",
			"<@{user}> has joined the pawty!",
			"<@{user}> i-is hewe, ^•ﻌ•^ wun for it!"
		]
	}
};

export default owo_main;