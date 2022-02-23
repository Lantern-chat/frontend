import { CLIENT } from "state/global";
import { Snowflake } from "state/models";
import { DispatchableAction } from "state/root";

import { DeleteMessage } from "client-sdk/src/api/commands/room";

export function deleteMessage(room_id: Snowflake, msg_id: Snowflake): DispatchableAction {
    return async () => {
        await CLIENT.execute(DeleteMessage({ room_id, msg_id }));
    };
}