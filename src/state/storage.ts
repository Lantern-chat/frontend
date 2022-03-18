import { ISession, parseSession } from "lib/session";
import { UserPreferences } from "./models";
import { prefsMutator } from "./mutators/prefs";

export const enum StorageKey {
    LOCALE = "LOCALE",
    SHOW_USER_LIST = "SHOW_USER_LIST",
    SESSION = "SESSION",
    PREFS = "PREFS",
    NOTIFICATIONS = "NOTIFICATIONS",
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
    let prefs = localStorage.getItem(StorageKey.PREFS), default_prefs = prefsMutator.default();
    return prefs ? { ...default_prefs, ...JSON.parse(prefs) } : default_prefs;
}