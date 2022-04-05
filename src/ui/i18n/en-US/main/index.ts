import type { BaseTranslation } from '../../i18n-types';

// @stringify
const enUS_main: BaseTranslation = {
    CHANNEL: "Channel",
    PARTY: "Party",
    DIRECT_MESSAGE: "Direct Message",
    CREATE_DIRECT_MESSAGE: "Create Direct Message",
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
    }
};

export default enUS_main;