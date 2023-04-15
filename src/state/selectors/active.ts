import { Snowflake } from "state/models";
import { RootState } from "state/root";

export function activeParty(state: RootState): Snowflake | undefined {
    return state.chat.active_party;

    let parts = state.history.parts;
    return parts[0] == "rooms" ? parts[1] : undefined;
}

export function activeRoom(state: RootState): Snowflake | undefined {
    return state.chat.active_room;

    let parts = state.history.parts;
    return parts[0] == "rooms" ? parts[2] : undefined;
}