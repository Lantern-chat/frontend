import { DispatchableAction } from "state/actions";
import { CLIENT } from "state/global";
import { Snowflake } from "state/models";

import { StartTyping } from "client-sdk/src/api/commands/room";

export function startTyping(room_id: Snowflake): DispatchableAction {
    return async () => {
        await CLIENT.execute(StartTyping({ room_id }));
    }
}