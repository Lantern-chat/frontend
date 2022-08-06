import { Snowflake, split_profile_bits, User, UserProfileSplitBits } from "state/models";
import { CachedUser, cache_key } from "state/mutators/cache";
import { RootState, Type, useRootDispatch } from "state/root";

const DEFAULT_PROFILE_BITS: UserProfileSplitBits = {
    roundedness: 0,
    override_color: false,
    color: 0,
}

export function selectCachedUser(state: RootState, user_id: Snowflake, party_id?: Snowflake): CachedUser {
    let cached = state.cache.users[cache_key(user_id, party_id)];

    if(!cached) {
        if(!party_id || party_id == '@me') {
            let fallback;

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
        } else {
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

        if(cached) {
            cached.bits = cached.profile ? split_profile_bits(cached.profile) : DEFAULT_PROFILE_BITS;

            useRootDispatch()({ type: Type.CACHE_USER, cached });
        }
    }

    return cached;
}