import { Font, hasUserPrefFlag, UserPreferenceFlags, UserPreferences } from "state/models";
import { Action, Type } from "../actions";

export type IPrefsState = PartialBy<UserPreferences, 'pad'>;

export const DEFAULT_STATE: IPrefsState = {
    locale: 0,
    friend_add: 3,
    temp: 7500,
    chat_font: Font.SansSerif,
    ui_font: Font.SansSerif,
    chat_font_size: 1.0,
    ui_font_size: 1.0,
    tab_size: 4,
    time_format: "",
    flags: UserPreferenceFlags.AllowDms | UserPreferenceFlags.GroupLines,
};

export function prefsReducer(state: IPrefsState = DEFAULT_STATE, action: Action) {
    if(action.type == Type.UPDATE_PREFS) {
        state = { ...state, ...action.prefs };
    }

    return state;
}

export function getPad(prefs: IPrefsState): number {
    let pad = prefs.pad;
    return pad != null ? pad : (hasUserPrefFlag(prefs as any, UserPreferenceFlags.CompactView) ? 0 : 16);
}