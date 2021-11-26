import { DispatchableAction, Type } from "state/actions";
import { setTheme as setRealTheme } from "lib/theme";
import { StorageKey } from "state/storage";
import { hasUserPrefFlag, UserPreferenceFlags, UserPreferences } from "state/models";

var dispatch_timeout: number;

export function setTheme(temperature: number, is_light: boolean, oled?: boolean): DispatchableAction {
    return (dispatch, getState) => {
        let reduce_motion = hasUserPrefFlag(getState().prefs, UserPreferenceFlags.ReduceAnimations);

        let theme = { temperature, is_light, oled };
        setRealTheme(theme, !reduce_motion);

        // effectively debounces the theme setting in redux, avoiding costly subscription updates
        clearTimeout(dispatch_timeout);
        dispatch_timeout = setTimeout(() => {
            let prefs = getState().prefs,
                flags = prefs.flags;

            if(is_light) {
                flags |= UserPreferenceFlags.LightMode;
            } else {
                flags &= ~UserPreferenceFlags.LightMode;
            }

            if(oled) {
                flags |= UserPreferenceFlags.OledMode;
            } else {
                flags &= ~UserPreferenceFlags.OledMode;
            }

            let partial_prefs: Partial<UserPreferences> = {
                flags,
                temp: temperature,
            };

            localStorage.setItem(StorageKey.PREFS, JSON.stringify({ ...prefs, ...partial_prefs }));

            dispatch({ type: Type.UPDATE_PREFS, prefs: partial_prefs });
        }, 500);
    };
}