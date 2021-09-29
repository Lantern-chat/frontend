import { Snowflake } from "state/models";
import { CachedUserPresence } from "state/reducers/cache";
import { RootState } from "state/root";

export function selectCachedUser(state: RootState, user_id: Snowflake, party_id?: Snowflake): CachedUserPresence | undefined {
    return state.cache.users.get(genCachedUserKey(user_id, party_id));
}

export function genCachedUserKey(user_id: Snowflake, party_id?: Snowflake): string {
    return user_id + (party_id || '');
}