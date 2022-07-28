import type { NamespaceMainTranslation } from '../../i18n-types'

// @stringify
const es_main: NamespaceMainTranslation = {
	CHANNEL: "Habitación",
	PARTY: "Partido",
	DIRECT_MESSAGE: "Mensaje Directo",
	CREATE_DIRECT_MESSAGE: "Crear Mensaje Directo",
	BOT: "{{verified:✔|}} Bot",
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
	channel: {
		TOP1: "¡Has llegado a la cima de #{0}!",
		TOP2: "Felicidades por llegar tan lejos."
	},
	menus: {
		COPY_ID: "Copiar ID",
		MARK_AS_READ: "Marcar como leído",
		INVITE_PEOPLE: "Invitar a la gente",
		msg: {
			DELETE: "Eliminar Mensaje",
			CONFIRM: "¿Estás seguro?",
			EDIT: "Editar Mensaje",
			COPY: "Copiar Mensaje",
			COPY_SEL: "Copiar Selección",
			REPORT: "Mensaje de Informe",
		},
		room: {
			EDIT: "Editar Canal",
		},
		room_list: {
			CREATE: "Crear Canal",
		}
	},
	member_list: {
		ROLE: "{role} – {length|number}",
	},
	lightbox: {
		META: " — {width|number} x {height|number} ({size|bytes})",
	},
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
		SELECT_CATEGORY: "Seleccione cualquier categoría para ver la configuración",
		account: {
			QUOTA: "{used|bytes}/{total|bytes} ({percent|percent}) Cuota de carga utilizada",
			DEV_MODE: "Habilitar el Modo de Desarrollador"
		},
		appearance: {
			THEME: "Tema",
			GROUP_LINES: "Mostrar líneas entre Grupos",
			GROUP_PADDING: "Relleno de Grupo",
			LIGHT_THEME: "Tema Ligero",
			DARK_THEME: "Tema Oscuro",
			OLED_THEME: "Habilitar el Tema Oscuro de OLED",
			TEMP: "Temperatura",
			VIEW_MODE: "Modo de vista",
			COMPACT: "Compacto",
			COZY: "Acogedor",
			FONT_EXAMPLE: "\"El veloz murciélago hindú comía feliz cardillo y kiwi. La cigüeña tocaba el saxofón detrás del palenque de paja.\"",
			CHAT_FONT_SIZE: "Tamaño de fuente de Chat",
			UI_FONT_SIZE: "Tamaño de fuente d IU",
			CHAT_FONT_FAMILY: "Tipo de letra del Chat",
			UI_FONT_FAMILY: "Tipo de letra de la IU",
		},
		notifications: {
			ENABLE_DESKTOP_NOTIFICATIONS: [
				"Habilitar Notificaciones de Escritorio",
				"Habilitar Notificaciones de Escritorio (puede estar desactualizado si se revoca externamente)",
				"Habilitar Notificaciones de Escritorio (no disponible)",
			]
		},
		media: {
			MUTE_MEDIA: "Silenciar medios por defecto",
			HIDE_UNKNOWN: "Deshabilitar archivos adjuntos de tamaño desconocido",
			USE_PLATFORM_EMOJIS: "Usar emojis de plataforma",
			ENABLE_SPELLCHECK: "Habilitar corrector ortográfico"
		},
		accessibility: {
			REDUCE_MOTION: "Reducir Movimiento",
			UNFOCUS_PAUSE: "Pausar GIF en Desenfocar",
			LOW_BANDWIDTH: "Habilitar el modo de ancho de banda bajo",
		}
	},
	system: {
		welcome: [
			"¡Hola, <@{user}>!",
			"¡<@{user}> se ha unido a la fiesta!",
			"¡<@{user}> está aquí, dispérsense!"
		]
	}
};

export default es_main;
