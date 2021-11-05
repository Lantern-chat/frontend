import { fetch, XHRMethod } from "lib/fetch";
import { DispatchableAction, Type } from "state/actions";
import { Room, Snowflake } from "state/models";

export enum SearchMode {
    Before = "before",
    After = "after",
    Around = "around",
}

export function loadMessages(room_id: Snowflake, search?: Snowflake, mode: SearchMode = SearchMode.After): DispatchableAction {
    return async (dispatch, getState) => {
        let state = getState();

        let query = "?limit=100";

        if(search) {
            query += `&${mode}=` + search;
        }

        // TODO: Run this in a loop to fetch ALL messages since search, IF AND ONLY IF there is a search id
        try {
            let url = `/api/v1/room/${room_id}/messages${query}`;

            __DEV__ && console.log("FETCHING:", url);

            let res = await fetch({
                url,
                method: XHRMethod.GET,
                bearer: state.user.session!.auth,
            });

            if(res.status == 200) {
                dispatch({ type: Type.MESSAGES_LOADED, room_id, msgs: res.response, mode });
            }
        } catch(e) {
            if(__DEV__) {
                alert("Error loading messages");
                console.error(e);
            }
        }
    };
}