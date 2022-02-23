import { DispatchableAction, Type } from "state/actions";
import { CLIENT } from "state/global";
import { UserPreferenceFlags, UserPreferences } from "state/models";

import { UpdateUserPrefs } from "client-sdk/src/api/commands/user";

var temp_prefs: Partial<UserPreferences> = {};
var dispatch_timeout: number;

export function savePrefs(prefs: Partial<UserPreferences>): DispatchableAction {
    return async (dispatch) => {
        temp_prefs = { ...temp_prefs, ...prefs };

        dispatch({ type: Type.UPDATE_PREFS, prefs });

        clearTimeout(dispatch_timeout);
        dispatch_timeout = setTimeout(async () => {
            await CLIENT.execute(UpdateUserPrefs({ prefs: temp_prefs }));

            temp_prefs = {};
        }, 500);
    };
}

export function savePrefsFlag(flag: UserPreferenceFlags, value: boolean): DispatchableAction {
    return (dispatch, getState) => {
        // if possible, use the latest temp prefs flags, otherwise get the state ones
        let flags = temp_prefs.flags ?? getState().prefs.flags;

        if(value) {
            flags |= flag;
        } else {
            flags &= ~flag;
        }

        dispatch(savePrefs({ flags }));
    };
}