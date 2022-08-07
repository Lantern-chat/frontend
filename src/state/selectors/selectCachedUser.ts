import { Message, Snowflake, split_profile_bits, User, UserProfileSplitBits } from "state/models";
import { CachedUser, cache_key, DEFAULT_PROFILE_BITS } from "state/mutators/cache";
import { RootState, Type, useRootDispatch } from "state/root";

export function selectCachedUserFromMessage(state: RootState, msg: Message): CachedUser {
    return selectCachedUser(state, msg.author.id, msg.party_id, msg.author);
}

export function selectCachedUser(state: RootState, user_id: Snowflake, party_id?: Snowflake, fallback?: User): CachedUser {
    let cached = state.cache.users[cache_key(user_id, party_id)];

    if(!cached) {
        if(party_id && party_id != '@me') {
            let member = state.party.parties[party_id]?.members[user_id];

            if(member) {
                cached = {
                    user: member.user,
                    nick: member.nick || member.user.username,
                    profile: member.user.profile,
                    presence: member.presence,
                    party_id,
                    bits: DEFAULT_PROFILE_BITS,
                };
            }
        }

        // if there was no party id or no member entry for said party, try any regular user info
        if(!(cached = cached || state.cache.users[user_id])) {

            // TODO: Search through DMs and friendlist
            if(user_id == state.user.user?.id) {
                fallback = state.user.user;
            }

            if(fallback) {
                cached = {
                    user: fallback,
                    nick: fallback.username,
                    profile: fallback.profile,
                    presence: state.user.user?.id == fallback.id ? state.user.presence : undefined,
                    bits: DEFAULT_PROFILE_BITS,
                };
            }
        }

        if(cached) {
            cached.bits = cached.profile ? split_profile_bits(cached.profile) : cached.bits;

            useRootDispatch()({ type: Type.CACHE_USER, cached });
        }
    }

    console.log(cached, user_id, party_id);

    return cached;
}