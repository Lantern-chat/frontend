import type { NamespaceMainTranslation } from '../../i18n-types';

// @stringify
const idID_main: NamespaceMainTranslation = {
    CHANNEL: "Channel",
    PARTY: "Pesta",
    DIRECT_MESSAGE: "Pesan Langsung",
    CREATE_DIRECT_MESSAGE: "Buat Pesan Langsung",
    //BOT: "{verified:boolean | {true:✔,*:}} Bot",
    BOT: "{{Terferifikasi:✔|}} Bot",
    ONLINE: "Dalam Jaringan",
    OFFLINE: "Luar Jaringan",
    BUSY: "Sibuk/Jangan Ganggu",
    AWAY: "Tidak Ada",
    MESSAGE: "Pesan",
    SETTINGS: "Pengaturan",
    MUTE: "Bisukan",
    UNMUTE: "Bunyikan",
    DEAFEN: "Tulikan",
    UNDEAFEN: "Nyalakan",
    EDITED: "Telah disunting",
    EDITED_ON: "Disunting pada {ts}",
    PINNED: "Disematkan",
    MESSAGE_PINNED: "Pesan disematkan",
    SPOILER_TITLE: "Klik untuk melihat spoiler",
    OWNER: "Pemilik",
    VIEWING_OLDER: "Anda sedang melihat pesan yang lama",
    GOTO_NOW: "Pergi ke saat ini",
    USERS_TYPING: [
        "{0} sedang mengekit...", // 1 user
        "{0} dan {1} sedang mengekit...", // 2 users
        "{0}, {1}, dan {2} sedang mengekit...", // 3 users
        "{0}, {1}, {2}, dan {3} lainnya sedang mengekit...", // 4+ users
    ],
    channel: {
        TOP1: "Anda telah mencapai puncak dari #{0}!",
        TOP2: "Terima kasih telah mencapai sini."
    },
    menus: {
        COPY_ID: "Salin ID",
        MARK_AS_READ: "Tandai telah baca",
        INVITE_PEOPLE: "Undang Orang",
        msg: {
            DELETE: "Hapus Pesan",
            CONFIRM: "Apakah kamu yakin?",
            EDIT: "Sunting Pesan",
            COPY: "Salin Pesan",
            COPY_SEL: "Salin Pesan Terpilih",
            REPORT: "Laporkan Pesan",
        },
        room: {
            EDIT: "Suting Channel",
        },
        room_list: {
            CREATE: "Buat Channel",
        }
    },
    member_list: {
        ROLE: "{role} – {length|number}",
    },
    lightbox: {
        META: " — {width|number} x {height|number} ({size|bytes})",
    },
    settings: {
        ACCOUNT: "Akun",
        PROFILE: "Profile",
        PRIVACY: "Privacy",
        NOTIFICATIONS: "Notifikasi",
        APPEARANCE: "Penampilan",
        ACCESSIBILITY: "Aksesibilitas",
        TEXT_AND_MEDIA: "Teks & Media",
        LANGUAGE: "Bahasa",
        LOGOUT: "Logout",
        RETURN: "Kembali",
        SELECT_CATEGORY: "Pilih sebuah kategori untuk melihat pengaturan.",
        account: {
            QUOTA: "{used|bytes}/{total|bytes} ({percent|percent}) Kuota Upload Digunakan",
            DEV_MODE: "Aktikan Mode Pengembang",
        },
        appearance: {
            THEME: "Tema",
            GROUP_LINES: "Tunjukkan spasi antara grup",
            GROUP_PADDING: "Padding Grup",
            LIGHT_THEME: "Tema Terang",
            DARK_THEME: "Tema Gelap",
            OLED_THEME: "Aktifkan OLED Tema Gelap",
            TEMP: "Temperatur",
            VIEW_MODE: "Mode Penglihat",
            COMPACT: "Compact",
            COZY: "Cozy",
            FONT_EXAMPLE: "\"The wizard quickly jinxed the gnomes before they vaporized.\"",
            CHAT_FONT_SIZE: "Ukuran Font Pesan",
            UI_FONT_SIZE: "Ukuran Font UI",
            CHAT_FONT_FAMILY: "Font Pesan",
            UI_FONT_FAMILY: "Font UI",
        },
        notifications: {
            ENABLE_DESKTOP_NOTIFICATIONS: [
                "Aktivasi Notifikasi Desktop",
                "Aktivasi Notifikasi Desktop (Mungkin dapat kadaluwarsa jika dinonaktifkan secara eksternal)",
                "Aktivasi Notifikasi Desktop (Tidak tersedia)",
            ]
        },
        media: {
            MUTE_MEDIA: "Bisukan Media Secara Default",
            HIDE_UNKNOWN: "Nonaktifkan Lampiran yang Tidak Diketahui Ukurannya",
            USE_PLATFORM_EMOJIS: "Gunakan Emoji Platform",
            ENABLE_SPELLCHECK: "Aktivasi Spellcheck",
        },
        accessibility: {
            REDUCE_MOTION: "Reduce Motion",
            UNFOCUS_PAUSE: "Jeda GIFs pada saat tidak fokus",
        }
    },
    system: {
        welcome: [
            "Selamat datang, <@{user}>!",
            "<@{user}> telah mengikuti pestanya",
            "<@{user}> disini, lari!"
        ]
    }
};

export default idID_main;