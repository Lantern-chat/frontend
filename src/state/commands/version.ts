import { DispatchableAction, Type } from "state/actions";

export function checkVersion(): DispatchableAction {
    return async (dispatch, state) => {
        let old = state.window.latest_version;

        try {
            // GET requests can be cached, causing version mismatches,
            // so append Date.now() to bust the cache
            let resp = await fetch(`/static/version.txt?${Date.now()}`);
            let new_version = await resp.text();

            if(old != new_version) {
                dispatch({ type: Type.NEW_VERSION, version: new_version });
            }
        } catch(_) {

        }
    }
}