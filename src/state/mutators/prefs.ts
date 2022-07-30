import { mutatorWithDefault } from "solid-mutant";
import { Font, hasUserPrefFlag, UserPreferenceFlags, UserPreferences } from "state/models";
import { Action, Type } from "../actions";

export type IPrefsState = PartialBy<UserPreferences, 'pad'>;

export const prefsMutator = mutatorWithDefault(
    () => ({
        locale: 0,
        friend_add: 3,
        temp: 7500,
        chat_font: Font.SansSerif,
        ui_font: Font.SansSerif,
        chat_font_size: 16,
        ui_font_size: 16,
        tab_size: 4,
        time_format: "",
        flags: UserPreferenceFlags.AllowDms | UserPreferenceFlags.GroupLines,
        // give this an explicit undefined value so the key is present
        pad: undefined,
    }),
    (state: IPrefsState, action: Action) => {
        if(action.type == Type.UPDATE_PREFS) {
            // copy new preferences to state
            let prefs = action.prefs;
            for(let key in prefs) {
                state[key] = prefs[key];
            }
        }
    }
);

export function getPad(prefs: IPrefsState): number {
    let pad = prefs.pad;
    return pad != null ? pad : (hasUserPrefFlag(prefs as any, UserPreferenceFlags.CompactView) ? 0 : 16);
}