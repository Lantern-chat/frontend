import { fetch, XHRMethod } from "lib/fetch";
import dayjs from "lib/time";
import { DispatchableAction, Type } from "state/actions";
import { Room, Snowflake } from "state/models";

var msg_counter = 1;

export function sendMessage(room_id: Snowflake, content: string): DispatchableAction {
    return async (dispatch, getState) => {
        // TODO: Display error
        if(content.length == 0 || content.length > 5000) return;

        let state = getState(), { user, session } = state.user;

        let now = dayjs();

        dispatch({
            type: Type.MESSAGE_SEND, msg: {
                id: (msg_counter += 1).toString(),
                author: user!,
                content,
                created_at: now.toISOString(),
                room_id,
                flags: 0,
            }
        });

        let res = await fetch({
            url: `/api/v1/room/${room_id}/messages`,
            method: XHRMethod.POST,
            bearer: session!.auth,
            json: { content },
        });

        // TODO: Handle errors
    };
}