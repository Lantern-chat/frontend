import { fetch, XHRMethod } from "lib/fetch";
import { Snowflake } from "state/models";
import { DispatchableAction } from "state/root";

export function deleteMessage(room_id: Snowflake, msg_id: Snowflake): DispatchableAction {
    return async (dispatch, getState) => {
        let state = getState(), { user, session } = state.user;

        let res = await fetch({
            url: `/api/v1/room/${room_id}/messages/${msg_id}`,
            method: XHRMethod.DELETE,
            bearer: session!.auth,
        });

    };
}