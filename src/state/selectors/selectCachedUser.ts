import { Snowflake } from "state/models";
import { CachedUserPresence } from "state/reducers/cache";
import { RootState } from "state/root";

export function selectCachedUser(state: RootState, user_id: Snowflake, party_id?: Snowflake): CachedUserPresence | undefined {
    let fused_id = user_id + (party_id || '');

    return state.cache.users.get(fused_id);
}