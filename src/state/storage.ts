import { ISession, parseSession } from "lib/session";
import { DEFAULT_THEME, ITheme } from "lib/theme";

export enum StorageKey {
    LOCALE = "LOCALE",
    SHOW_USER_LIST = "SHOW_USER_LIST",
    SESSION = "SESSION",
    THEME = "THEME",
}

export function loadTheme(): ITheme {
    let theme = localStorage.getItem(StorageKey.THEME);

    return theme ? { ...DEFAULT_THEME, ...JSON.parse(theme) } : DEFAULT_THEME;
}

export function loadSession(): ISession | null {
    return parseSession(localStorage.getItem(StorageKey.SESSION));
}

export function storeSession(session: ISession | null) {
    if(session != null) {
        localStorage.setItem(StorageKey.SESSION, JSON.stringify(session));
    } else {
        localStorage.removeItem(StorageKey.SESSION);
    }
}