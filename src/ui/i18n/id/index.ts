import type { Translation } from '../i18n-types';

// @stringify
const id: Translation = {
    DEV_BANNER: "Versi ini adalah versi pengembangan.",
    YEAR: "Tahun",
    MONTH: "Bulan",
    DAY: "Tanggal",
    REGISTER: "Registrasi",
    LOGIN: "Login",
    EMAIL_ADDRESS: "Alamat Email",
    USERNAME: "Nama pengguna",
    USERNAME_OR_EMAIL: "Nama pengguna atau alamat email",
    NICKNAME: "Nama panggilan",
    PASSWORD: "Kata sandi",
    RESET: "Setel ulang",
    DATE_OF_BIRTH: "Tanggal ulang tahun",
    NETWORK_ERROR: "Kesalahan jaringan",
    UNKNOWN_ERROR: "Kesalahan yang tidak diketahui",
    MFA_TOGGLE_TEXT: "{{h:Tidak memiliki|Memiliki}} kode 2FA?",
    MFA_TOGGLE_FLAVOR: "Klik disini untuk {{h:sembunyikan|tunjukkan}} input.",
    MFA_CODE: "Kode 2FA",
    GOTO_LOGIN: "Pergi ke halaman Login",
    REGISTER_AGREE: "Dengan registrasi, anda menyetujui.... ini akan diisi nanti.",
    PASSWORD_REQS: "Kata sandi wajib mempunyai paling tidak 8 karakter dan memiliki paling tidak satu angka dan satu karakter spesial.",
    CHANGE_THEME: "Ubah Tema",
    CHANGE_THEME_TEMP: "Ubah Temperatur Tema",
    CHANGE_LANG: "Ganti Bahasa",
    LOADING: "Loading...",

    DEFAULT_TS_FORMAT: "dddd, DD/MMM/YYYY LT",
    CALENDAR_FORMAT: {
        lastDay: "[Kemarin pada] LT",
        sameDay: "[Hari ini pada] LT",
        nextDay: "[Besok pada] LT",
        nextWeek: "dddd [pada] LT",
        lastWeek: "dddd [kemarin pada] LT",
        sameElse: 'L'
    },
    // this is one sentence, split by HTML
    hCaptcha: "Situs ini dilindungi oleh hCaptcha dan <@Privacy Policy> dan <#Terms of Service> berlaku.",

    // units/dimensions
    units: {
        PX: "{0}px",
    }
};

export default id;