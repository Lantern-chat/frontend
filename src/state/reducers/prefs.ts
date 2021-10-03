import { Font, UserPreferences } from "state/models";
import { Action, Type } from "../actions";

export type IPrefsState = UserPreferences;

export const DEFAULT_STATE: IPrefsState = {
    locale: 0,
    friend_add: 3,
    reduce_anim: false,
    unfocus_pause: false,
    light: false,
    temp: 7500,
    compact: false,
    chat_font: Font.SansSerif,
    ui_font: Font.SansSerif,
    chat_font_size: 1.0,
    ui_font_size: 1.0,
    tab_size: 4,
    time_format: "",
    dev_mode: false,
};

export function prefsReducer(state: IPrefsState = DEFAULT_STATE, action: Action) {
    if(action.type == Type.UPDATE_PREFS) {
        state = { ...state, ...action.prefs };
    }

    return state;
}