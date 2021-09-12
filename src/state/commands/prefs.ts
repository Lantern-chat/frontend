
import { fetch, XHRMethod } from "lib/fetch";
import { DispatchableAction, Type } from "state/actions";
import { UserPreferences } from "state/models";
import { RootState } from "state/root";

export function savePrefs(prefs: Partial<UserPreferences>): DispatchableAction {
    return async (dispatch, getState) => {
        let state = getState();

        let res = await fetch({
            url: '/api/v1/user/@me/prefs',
            method: XHRMethod.PATCH,
            bearer: state.user.session!.auth,
            json: prefs,
        });

        dispatch({ type: Type.UPDATE_PREFS, prefs });
    };
}