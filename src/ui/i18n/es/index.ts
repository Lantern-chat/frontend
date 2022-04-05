import type { Translation } from '../i18n-types';

import 'dayjs/locale/es';

// @stringify
const es: Translation = {
    DEV_BANNER: "Esta es una compilación de desarrollo.",
    YEAR: "Año",
    MONTH: "Mes",
    DAY: "Día",
    REGISTER: "Registro",
    LOGIN: "Acceso",
    EMAIL_ADDRESS: "Dirección de correo electrónico",
    USERNAME: "Nombre de usuario",
    USERNAME_OR_EMAIL: "Nombre de usuario o correo electrónico",
    NICKNAME: "Apodo",
    PASSWORD: "Clave",
    RESET: "Reiniciar",
    DATE_OF_BIRTH: "Fecha de nacimiento",
    NETWORK_ERROR: "Error de red",
    UNKNOWN_ERROR: "Error desconocido",
    MFA_TOGGLE_TEXT: "¿{h|{true: No tienes, false: Tiene}} un código 2FA?",
    MFA_TOGGLE_FLAVOR: "Haga clic aquí para {h|{true: ocultar, false: mostrar}} a entrada.",
    MFA_CODE: "Código 2FA",
    GOTO_LOGIN: "Ir a Iniciar sesión",
    REGISTER_AGREE: "Al registrarse, acepta nuestros... esto se completará más adelante.",
    PASSWORD_REQS: "La contraseña debe tener al menos 8 caracteres y contener al menos un número o un carácter especial.",
    CHANGE_THEME: "Cambiar de apariencia",
    CHANGE_THEME_TEMP: "Cambiar la temperatura de apariencia",
    CHANGE_LANG: "Cambiar idioma",

    DEFAULT_TS_FORMAT: "dddd, MMM Do YYYY, h:mm A",
    CALENDAR_FORMAT: {
        lastDay: "[Ayer a las] h:mm A",
        sameDay: "[Hoy a las] h:mm A",
        nextDay: "[Mañana a las] h:mm A",
        nextWeek: "dddd [a las] h:mm A",
        lastWeek: "[El] dddd [pasado a las] h:mm A",
        sameElse: 'MM/DD/YYYY'
    },
    // NOTE: Special syntax for privacy and tos sections
    hCaptcha: "Este sitio está protegido por hCaptcha y se aplican su <@Política de Privacidad> y <#Términos de Servicio>.",
};

export default es;