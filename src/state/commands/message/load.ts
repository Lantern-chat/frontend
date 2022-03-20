import { DispatchableAction, Type } from "state/actions";
import { Snowflake } from "state/models";

import { GetMessages } from "client-sdk/src/api/commands/room";
import { CLIENT } from "state/global";

export enum SearchMode {
    Before = "before",
    After = "after",
}

export function loadMessages(room_id: Snowflake, search?: Snowflake, mode: SearchMode = SearchMode.After, cb?: () => void): DispatchableAction {
    return async (dispatch, state) => {
        try {
            if(false !== state.chat.rooms[room_id]?.is_loading) return;

            dispatch({ type: Type.MESSAGES_LOADING, room_id });

            dispatch({
                type: Type.MESSAGES_LOADED, room_id, mode,
                msgs: await CLIENT.execute(GetMessages({
                    room_id,
                    query: { [mode]: search, limit: 100 }
                }))
            });

            cb?.();

        } catch(e) {
            if(__DEV__) {
                alert("Error loading messages");
                console.error(e);
            }
        }
    };
}