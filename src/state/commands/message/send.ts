import { fetch, XHRMethod } from "lib/fetch";
import dayjs from "lib/time";
import { DispatchableAction, Type } from "state/actions";
import { Room, Snowflake } from "state/models";

import { CreateMessage } from "client-sdk/src/api/commands/room";
import { CLIENT } from "state/global";

var msg_counter = 1;

export function sendMessage(room_id: Snowflake, content: string, attachments?: Snowflake[]): DispatchableAction {
    return async (dispatch, getState) => {
        // TODO: Display error
        let has_attachments = attachments && attachments.length > 0;

        if((!has_attachments && content.length == 0) || content.length > 5000) return;

        //let now = dayjs();

        //dispatch({
        //    type: Type.MESSAGE_SEND, msg: {
        //        id: (msg_counter += 1).toString(),
        //        author: user!,
        //        content,
        //        created_at: now.toISOString(),
        //        room_id,
        //        flags: 0,
        //    }
        //});

        let res = await CLIENT.execute(CreateMessage({
            room_id,
            msg: { content, attachments }
        }));

        // TODO: Handle errors
    };
}