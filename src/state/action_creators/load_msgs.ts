import { fetch, XHRMethod } from "lib/fetch";
import { DispatchableAction, Type } from "state/actions";
import { Room, Snowflake } from "../models";

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
            let res = await fetch({
                url: `/api/v1/room/${room_id}/messages${query}`,
                method: XHRMethod.GET,
                bearer: state.user.session!.auth,
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if(res.status == 200) {
                dispatch({ type: Type.MESSAGES_LOADED, msgs: res.response });
            }
        } catch(e) {
            if(__DEV__) {
                alert("Error loading messages");
                console.error(e);
            }
        }
    };
}