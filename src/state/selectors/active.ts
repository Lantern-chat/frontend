import { Snowflake } from "state/models";
import { ReadRootState } from "state/root";

export function activeParty(state: ReadRootState): Snowflake | undefined {
    return state.chat.active_party;

    let parts = state.history.parts;
    return parts[0] == 'channels' ? parts[1] : undefined;
}

export function activeRoom(state: ReadRootState): Snowflake | undefined {
    return state.chat.active_room;

    let parts = state.history.parts;
    return parts[0] == 'channels' ? parts[2] : undefined;
}