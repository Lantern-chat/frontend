import { ISession, parseSession } from "lib/session";
import { UserPreferences } from "./models";
import { default_prefs } from "./mutators/prefs";

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
    let prefs = localStorage.getItem(StorageKey.PREFS), dp = default_prefs();
    return prefs ? { ...dp, ...JSON.parse(prefs) } : dp;
}