import { fetch, XHRMethod } from "lib/fetch";
import dayjs from "lib/time";
import { DispatchableAction, Type } from "state/actions";
import { Room, Snowflake } from "state/models";

import { CreateMessage } from "client-sdk/src/api/commands/room";
import { Driver } from "client-sdk/src/driver";
import { BearerToken } from "client-sdk/src/models/auth";

var msg_counter = 1;

export function sendMessage(room_id: Snowflake, content: string, attachments?: Snowflake[]): DispatchableAction {
    return async (dispatch, getState) => {
        // TODO: Display error
        let has_attachments = attachments && attachments.length > 0;

        if((!has_attachments && content.length == 0) || content.length > 5000) return;

        let state = getState(), { user, session } = state.user;

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

        let driver = new Driver('', new BearerToken(session!.auth));

        let res = await driver.execute(CreateMessage({
            room_id,
            msg: { content, attachments }
        }));

        // TODO: Handle errors
    };
}