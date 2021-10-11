import { fetch, XHRMethod } from "lib/fetch";
import { DispatchableAction, Type } from "state/actions";
import { UserPreferences } from "state/models";
import { RootState } from "state/root";

var temp_prefs: Partial<UserPreferences> = {};
var dispatch_timeout: number;

export function savePrefs(prefs: Partial<UserPreferences>): DispatchableAction {
    return async (dispatch, getState) => {
        temp_prefs = { ...temp_prefs, ...prefs };

        dispatch({ type: Type.UPDATE_PREFS, prefs });

        clearTimeout(dispatch_timeout);
        dispatch_timeout = setTimeout(async () => {
            let state = getState();

            let res = await fetch({
                url: '/api/v1/user/@me/prefs',
                method: XHRMethod.PATCH,
                bearer: state.user.session!.auth,
                json: temp_prefs,
            });

            temp_prefs = {};
        }, 500);
    };
}