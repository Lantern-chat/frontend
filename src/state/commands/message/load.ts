import { DispatchableAction, Type } from "state/actions";
import { Snowflake, Message } from "state/models";

import { GetMessages } from "client-sdk/src/api/commands/room";
import { CLIENT } from "state/global";

export enum SearchMode {
    Before = "before",
    After = "after",
}

export function loadMessages(room_id: Snowflake, search?: Snowflake, mode: SearchMode = SearchMode.After, cb?: () => void): DispatchableAction {
    return async (dispatch, state) => {
        let msgs: undefined | Message[];
        try {
            if(false !== state.chat.rooms[room_id]?.locked) return;

            dispatch({ type: Type.LOCK_ROOM, room_id });

            msgs = await CLIENT.execute(GetMessages({
                room_id,
                query: { [mode]: search, limit: 100 }
            }));

        } catch(e) {
            if(__DEV__) {
                alert("Error loading messages");
                console.error(e);
            }

            // TODO: Show error somewhere

        } finally {
            dispatch({ type: Type.MESSAGES_LOADED, room_id, mode, msgs });

            cb?.();
        }
    };
}