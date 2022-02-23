import { DispatchableAction, Type } from "state/actions";
import { Snowflake } from "state/models";

import { GetMessages } from "client-sdk/src/api/commands/room";
import { CLIENT } from "state/global";

export enum SearchMode {
    Before = "before",
    After = "after",
}

export function loadMessages(room_id: Snowflake, search?: Snowflake, mode: SearchMode = SearchMode.After): DispatchableAction {
    return async (dispatch) => {
        try {
            let msgs = await CLIENT.execute(GetMessages({
                room_id,
                query: { [mode]: search, limit: 100 }
            }));

            dispatch({ type: Type.MESSAGES_LOADED, room_id, msgs: msgs as any, mode });
        } catch(e) {
            if(__DEV__) {
                alert("Error loading messages");
                console.error(e);
            }
        }
    };
}