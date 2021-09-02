import { Snowflake } from "state/models";
import { RootState } from "state/root";

export function activeParty(state: RootState): Snowflake | undefined {
    let parts = state.history.parts;
    return parts[0] == 'channels' ? parts[1] : undefined;
}

export function activeRoom(state: RootState): Snowflake | undefined {
    let parts = state.history.parts;
    return parts[0] == 'channels' ? parts[2] : undefined;
}