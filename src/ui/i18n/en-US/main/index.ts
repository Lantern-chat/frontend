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
    RELOAD_PAGE: "Reload page for latest version",
    TOGGLE_USERLIST: "Toggle userlist panel",
    MUTE: "Mute",
    UNMUTE: "Unmute",
    DEAFEN: "Deafen",
    UNDEAFEN: "Undeafen",
    EDITED: "Edited",
    EDITED_ON: "Edited on {ts|timestamp}",
    PINNED: "Pinned",
    MESSAGE_PINNED: "Message Pinned",
    MESSAGE_STARRED: "Message Starred",
    OWNER: "Owner",
    VIEWING_OLDER: "You're viewing older messages.",
    GOTO_NOW: "Go to now",
    SPOILER_TITLE: "Click to reveal spoiler",
    SPOILER: "{{Uns|S}}poiler",
    SPOILER_ALL: "{{Uns|S}}poiler All",
    REMOVE: "Remove",
    REMOVE_ALL: "Remove All",
    SAVE: "Save",
    CONTINUE: "Continue Editing",
    DISCARD: "Discard",
    RESET: "Reset",
    UNSAVED: "You have unsaved changes!",
    ATTACH_FILE: "Attach File",
    SEND_MESSAGE: "Send Message",
    DROP_FILES: "Drop Files",
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
        ROLE: "{role:string} – {length:number|number}",
    },
    lightbox: {
        META: " — {width:number|number} x {height:number|number} ({size:number|bytes})",
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
            QUOTA: "{used:number|bytes}/{total:number|bytes} ({percent:number|percent}) Upload Quota Used",
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
            SHOW_DATE_CHANGE: "Show Date Change",
        },
        notifications: {
            ENABLE_DESKTOP_NOTIFICATIONS: [
                "Enable Desktop Notifications",
                "Enable Desktop Notifications (May be outdated if revoked externally)",
                "Enable Desktop Notifications (Not Available)",
            ]
        },
        privacy: {
            HIDE_LAST_ACTIVE: "Hide Last Active",
            HIDE_LAST_ACTIVE_SUBTEXT: "Will not display your approximate last-active time to other users",
        },
        media: {
            SMALL_ATTACHMENTS: "Smaller Attachments",
            SHOW_ATTACHMENT_GRID: "Show Attachments in Grid",
            SHOW_ATTACHMENT_GRID_SUBTEXT: "Arrange multiple attachments for a single message into a grid",
            SHOW_MEDIA_METADATA: "Show Media Metadata",
            SHOW_MEDIA_METADATA_SUBTEXT: "Displays file name, MIME type, and file size on attachments",
            MUTE_MEDIA: "Mute Media by Default",
            HIDE_UNKNOWN: "Disable Attachments of Unknown Size",
            USE_PLATFORM_EMOJIS: "Use Platform Emojis",
            ENABLE_SPELLCHECK: "Enable Spellcheck",
        },
        accessibility: {
            REDUCE_MOTION: "Reduce Motion",
            REDUCE_MOTION_SUBTEXT: "Reduces or removes animations and transitions",

            UNFOCUS_PAUSE: "Pause GIFs on Unfocus",

            LOW_BANDWIDTH: "Enable Low-Bandwidth Mode",
            LOW_BANDWIDTH_SUBTEXT: "Uses lower quality assets and will not display attachments until requested",

            FORCE_COLOR_CONTRAST: "Force Constrasting Colors",
            FORCE_COLOR_CONTRAST_SUBTEXT: "Adjusts custom colors from users or roles to be visible against the background",

            SHOW_GREY_IMG_BG: "Show Grey Image Background",
            SHOW_GREY_IMG_BG_SUBTEXT: "Helps make mostly-transparent images more visible",
        },
        profile: {
            AVATAR_ROUNDNESS: "Avatar Roundness",
            STATUS: "Status",
            BIO: "Biography",
            CHANGE_AVATAR: "Change Avatar",
            CHANGE_BANNER: "Change Banner",
            REMOVE_AVATAR: "Remove Avatar",
            REMOVE_BANNER: "Remove Banner",
        }
    },
    system: {
        welcome: [
            "Welcome, <@{user:string}>!",
            "<@{user:string}> has joined the party!",
            "<@{user:string}> is here, scatter!"
        ],
        unavailable: "Message Unavailable",
    }
};

export default enUS_main;