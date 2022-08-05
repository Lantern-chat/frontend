import { Snowflake, split_profile_bits, User } from "state/models";
import { CachedUser, cache_key } from "state/mutators/cache";
import { RootState, Type, useRootDispatch } from "state/root";

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
                };
            }
        } else {
            let party = state.party.parties[party_id];

            if(party) {
                let member = party.members[user_id];

                if(member) {
                    cached = {
                        user: member.user,
                        nick: member.nick || member.user.username,
                        profile: member.user.profile,
                        presence: member.presence,
                        party_id,
                    };
                }
            }
        }

        if(cached) {
            if(cached.profile) {
                cached.bits = split_profile_bits(cached.profile);
            }

            __DEV__ && console.log("Caching", cached);

            useRootDispatch()({
                type: Type.CACHE_USER,
                cached,
            });
        }
    }

    return cached;
}