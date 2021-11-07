import { PartyMember, Snowflake, User } from "state/models";
import { CachedUser } from "state/reducers/cache";
import { RootState } from "state/root";

export function selectCachedUser(state: RootState, user_id: Snowflake, party_id?: Snowflake): PartyMember | undefined {
    if(party_id) {
        let party = state.party.parties.get(party_id);
        if(!party) return;

        let member = party.members.get(user_id);
        if(!member) return;

        return member;
    }

    // TODO: Search through DMs and whatever

    return;
}

export function genCachedUserKey(user_id: Snowflake, party_id?: Snowflake): string {
    return user_id + (party_id || '');
}