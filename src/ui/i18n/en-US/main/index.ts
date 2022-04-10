import type { BaseTranslation } from '../../i18n-types';

// @stringify
const enUS_main: BaseTranslation = {
    CHANNEL: "Channel",
    PARTY: "Party",
    DIRECT_MESSAGE: "Direct Message",
    CREATE_DIRECT_MESSAGE: "Create Direct Message",
    //BOT: "{verified:boolean | {true:✔,*:}} Bot",
    BOT: "{{verified:✔|}} Bot",
    ONLINE: "Online",
    OFFLINE: "Offline",
    BUSY: "Busy/Do Not Disturb",
    AWAY: "Away",
    MESSAGE: "Message",
    SETTINGS: "Settings",
    MUTE: "Mute",
    UNMUTE: "Unmute",
    DEAFEN: "Deafen",
    UNDEAFEN: "Undeafen",
    EDITED: "Edited",
    EDITED_ON: "Edited on {ts:string}",
    PINNED: "Pinned",
    MESSAGE_PINNED: "Message Pinned",
    SPOILER_TITLE: "Click to reveal spoiler",
    OWNER: "Owner",
    VIEWING_OLDER: "You're viewing older messages.",
    GOTO_NOW: "Go to now",
    USERS_TYPING: [
        "{0:string} is typing...", // 1 user
        "{0:string} and {1:string} are typing...", // 2 users
        "{0:string}, {1:string}, and {2:string} are typing...", // 3 users
        "{0:string}, {1:string}, {2:string}, and {3:number} others are typing...", // 4+ users
    ],
    channel: {
        TOP1: "You have reached the top of #{0}!",
        TOP2: "Congrats on making it this far."
    },
    menus: {
        COPY_ID: "Copy ID",
        MARK_AS_READ: "Mark as Read",
        INVITE_PEOPLE: "Invite People",
        msg: {
            DELETE: "Delete Message",
            CONFIRM: "Are you sure?",
            EDIT: "Edit Message",
            COPY: "Copy Message",
            COPY_SEL: "Copy Selection",
            REPORT: "Report Message",
        },
        room: {
            EDIT: "Edit Channel",
        },
        room_list: {
            CREATE: "Create Channel",
        }
    },
    member_list: {
        ROLE: "{role:string} – {length:number}",
    },
    settings: {
        ACCOUNT: "Account",
        PROFILE: "Profile",
        PRIVACY: "Privacy",
        NOTIFICATIONS: "Notifications",
        APPEARANCE: "Appearance",
        ACCESSIBILITY: "Accessibility",
        TEXT_AND_MEDIA: "Text & Media",
        LANGUAGE: "Language",
        LOGOUT: "Logout",
        RETURN: "Return",
        SELECT_CATEGORY: "Select any category to view settings",
        account: {
            QUOTA: "{used:string}/{total:string} ({percent:string}) Upload Quota Used",
            DEV_MODE: "Enable Developer Mode"
        },
        appearance: {
            THEME: "Theme",
            GROUP_LINES: "Show Lines Between Groups",
            GROUP_PADDING: "Group Padding",
            LIGHT_THEME: "Light Theme",
            DARK_THEME: "Dark Theme",
            OLED_THEME: "Enable OLED Dark Theme",
            TEMP: "Temperature",
            VIEW_MODE: "View Mode",
            COMPACT: "Compact",
            COZY: "Cozy",
            FONT_EXAMPLE: "\"The wizard quickly jinxed the gnomes before they vaporized.\"",
            CHAT_FONT_SIZE: "Chat Font Size",
            UI_FONT_SIZE: "UI Font Size",
            CHAT_FONT_FAMILY: "Chat Font Family",
            UI_FONT_FAMILY: "UI Font Family",
        },
        notifications: {
            ENABLE_DESKTOP_NOTIFICATIONS: [
                "Enable Desktop Notifications",
                "Enable Desktop Notifications (May be outdated if revoked externally)",
                "Enable Desktop Notifications (Not Available)",
            ]
        },
        media: {
            MUTE_MEDIA: "Mute Media by Default",
            HIDE_UNKNOWN: "Disable Attachments of Unknown Size",
            USE_PLATFORM_EMOJIS: "Use Platform Emojis",
            ENABLE_SPELLCHECK: "Enable Spellcheck"
        },
        accessibility: {
            REDUCE_MOTION: "Reduce Motion",
            UNFOCUS_PAUSE: "Pause GIFs on Unfocus",
        }
    }
};

export default enUS_main;