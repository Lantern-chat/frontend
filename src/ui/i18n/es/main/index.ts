import type { NamespaceMainTranslation } from '../../i18n-types'

// @stringify
const es_main: NamespaceMainTranslation = {
	CHANNEL: "Habitación",
	PARTY: "Partido",
	DIRECT_MESSAGE: "Mensaje Directo",
	CREATE_DIRECT_MESSAGE: "Crear Mensaje Directo",
	ONLINE: "En línea",
	OFFLINE: "Desconectado",
	BUSY: "Ocupado / No molestar",
	AWAY: "Fuera",
	MESSAGE: "Mensaje",
	SETTINGS: "Configuración",
	MUTE: "Silenciar",
	UNMUTE: "Desilenciar",
	DEAFEN: "Ensordecer",
	UNDEAFEN: "Desensordecer",
	EDITED: "Editado",
	EDITED_ON: "Editado el {ts}",
	PINNED: "Anclado",
	MESSAGE_PINNED: "Mensaje Fijado",
	SPOILER_TITLE: "Haga clic para revelar el spoiler",
	OWNER: "Dueño",
	VIEWING_OLDER: "Estás viendo mensajes antiguos.",
	GOTO_NOW: "Ir a ahora", // Maybe "Ir al más nuevo" for "go to newest"?
	USERS_TYPING: [
		"{0} está escribiendo...", // 1 user
		"{0} y {1} están escribiendo...", // 2 users
		"{0}, {1}, y {2} están escribiendo...", // 3 users
		"{0}, {1}, {2}, y {3} más están escribiendo...", // 4+ users, parameter 3 is a number
	],
	settings: {
		ACCOUNT: "Cuenta",
		PROFILE: "Perfil",
		PRIVACY: "Intimidad",
		NOTIFICATIONS: "Notificaciones",
		APPEARANCE: "Apariencia",
		ACCESSIBILITY: "Accesibilidad",
		TEXT_AND_MEDIA: "Texto y medios",
		LANGUAGE: "Idioma",
		LOGOUT: "Cerrar sesión",
		RETURN: "Volver",
	}
};

export default es_main;
