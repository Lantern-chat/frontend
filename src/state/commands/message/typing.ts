import { fetch, XHRMethod } from "lib/fetch";
import { DispatchableAction } from "state/actions";
import { Snowflake } from "state/models";

export function startTyping(room_id: Snowflake): DispatchableAction {
    return async (dispatch, getState) => {
        let res = await fetch({
            url: `/api/v1/room/${room_id}/typing`,
            method: XHRMethod.POST,
            bearer: getState().user.session!.auth
        });

        if(res.status != 204) {
            console.error("Error sending typing start event");
        }
    }
}