import { PartyMember, Snowflake, User } from "state/models";
import { CachedUser } from "state/mutators/cache";
import { ReadRootState } from "state/root";

export function selectCachedUser(state: ReadRootState, user_id: Snowflake, party_id?: Snowflake): DeepReadonly<PartyMember> | undefined {
    if(party_id) {
        let party = state.party.parties[party_id];
        if(!party) return;

        let member = party.members[user_id];
        if(!member) return;

        return member;
    }

    // TODO: Search through DMs and whatever

    return;
}

export function genCachedUserKey(user_id: Snowflake, party_id?: Snowflake): string {
    return user_id + (party_id || '');
}