import { Message, Snowflake, split_profile_bits, User, UserProfileSplitBits } from "state/models";
import { CachedUser, cache_key, DEFAULT_PROFILE_BITS } from "state/mutators/cache";
import { RootState, Type, useRootDispatch } from "state/root";

export const selectCachedUserFromMessage = (state: RootState, msg: Message): CachedUser =>
    selectCachedUser(state, msg.author.id, msg.party_id, msg.author);

export function selectCachedUser(state: RootState, user_id: Snowflake, party_id?: Snowflake, fallback?: User): CachedUser {
    let cached = state.cache.users[cache_key(user_id, party_id)];

    if(!cached) {
        // try to find a valid party with a member entry to take from
        if(party_id && party_id != "@me") {
            let member = state.party.parties[party_id]?.members[user_id];

            if(member) {
                cached = {
                    user: member.user,
                    nick: member.user.profile?.nick || member.user.username,
                    profile: member.user.profile,
                    presence: member.user.presence,
                    party_id,
                    bits: DEFAULT_PROFILE_BITS,
                    last_active: undefined,
                };
            }
        }

        // otherwise, try fallbacks or just base user information, if any
        if(!cached) {
            // TODO: Search through DMs and friendlist
            if(!fallback) {
                let self = state.user.user;
                if(user_id == self?.id) {
                    fallback = self;
                } else {
                    // NOTE: There is no point in trying to re-cache an already cached plain user,
                    // so just return this.
                    let user = state.cache.users[user_id];
                    if(user) { return user; }
                }
            }

            if(fallback) {
                cached = {
                    user: fallback,
                    nick: fallback.profile?.nick || fallback.username,
                    profile: fallback.profile,
                    presence: state.user.user?.id == fallback.id ? state.user.presence : undefined,
                    bits: DEFAULT_PROFILE_BITS,
                    last_active: undefined,
                };
            }
        }

        if(cached) {
            cached.bits = cached.profile ? split_profile_bits(cached.profile) : cached.bits;

            useRootDispatch()({ type: Type.CACHE_USER, cached });
        }
    }

    return cached;
}