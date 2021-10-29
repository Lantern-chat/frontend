import { DispatchableAction, Type } from "state/actions";
import { setTheme as setRealTheme } from "lib/theme";
import { StorageKey } from "state/storage";
import { hasUserPrefFlag, UserPreferenceFlags } from "state/models";

var dispatch_timeout: number;

export function setTheme(temperature: number, is_light: boolean): DispatchableAction {
    return (dispatch, getState) => {
        let reduce_motion = hasUserPrefFlag(getState().prefs, UserPreferenceFlags.ReduceAnimations);

        let theme = { temperature, is_light };
        setRealTheme(theme, !reduce_motion);

        // effectively debounces the theme setting in redux, avoiding costly subscription updates
        clearTimeout(dispatch_timeout);
        dispatch_timeout = setTimeout(() => {
            let partial_prefs = {
                light: is_light,
                temp: temperature,
            };

            localStorage.setItem(StorageKey.PREFS, JSON.stringify({ ...getState().prefs, ...partial_prefs }));

            dispatch({ type: Type.UPDATE_PREFS, prefs: partial_prefs });
        }, 500);
    };
}