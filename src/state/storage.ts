import { ISession, parseSession } from "lib/session";
import { UserPreferences } from "./models";
import { DEFAULT_STATE as DEFAULT_PREFS } from "./reducers/prefs";

export enum StorageKey {
    LOCALE = "LOCALE",
    SHOW_USER_LIST = "SHOW_USER_LIST",
    SESSION = "SESSION",
    PREFS = "PREFS",
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

export function loadPrefs(): UserPreferences {
    let prefs = localStorage.getItem(StorageKey.PREFS);
    return prefs ? { ...DEFAULT_PREFS, ...JSON.parse(prefs) } : DEFAULT_PREFS;
}