import { PartyMemberEvent } from "client-sdk/src/models/gateway";
import { mutatorWithDefault } from "solid-mutant";
import { Action, Type } from "state/actions";
import { PartyMember, ServerMsgOpcode, Snowflake, split_profile_bits, User, UserPresence, UserProfile, UserProfileSplitBits } from "state/models";
import { GatewayMessageDiscriminator } from "worker/gateway/msg";

export interface CachedUser {
    user: User,
    nick: string,
    party_id?: Snowflake,
    roles?: Snowflake[],
    presence?: UserPresence,
    profile?: UserProfile | null,
    bits?: UserProfileSplitBits,
}

export interface ICacheState {
    users: Record<Snowflake, CachedUser>,
}

export function cache_key(user_id: Snowflake, party_id?: Snowflake): string {
    return (party_id && party_id != '@me') ? (party_id + '_' + user_id) : user_id;
}

export const cacheMutator = mutatorWithDefault(
    () => ({ users: {} }),
    (state: ICacheState, action: Action) => {
        switch(action.type) {
            case Type.CACHE_USER: {
                let cached = action.cached;

                let key = cache_key(cached.user.id, cached.party_id);

                let existing = state.users[key];
                if(existing) {
                    Object.assign(existing, cached);
                } else {
                    state.users[key] = cached;
                }

                console.log("Cached", key);

                break;
            }
            case Type.PROFILE_FETCHED: {
                let { user_id, party_id, profile } = action,
                    key = cache_key(user_id, party_id),
                    cached: CachedUser | undefined = state.users[key],
                    existing = cached?.profile;

                if(cached) {
                    if(existing) {
                        Object.assign(existing, profile);
                    } else {
                        cached.profile = profile;
                    }

                    cached.bits = split_profile_bits(profile);
                } else {
                    __DEV__ && console.log("Not caching profile", key);
                }

                break;
            }
            case Type.GATEWAY_EVENT: {
                let ap = action.payload;

                if(ap.t != GatewayMessageDiscriminator.Event) {
                    break;
                }

                let event = ap.p;

                switch(event.o) {
                    case ServerMsgOpcode.UserUpdate:
                    case ServerMsgOpcode.MemberUpdate: {
                        let p = event.p,
                            key = cache_key(p.user.id, (p as PartyMemberEvent).party_id),
                            cached = state.users[key];

                        if(cached) {
                            Object.assign(cached.user, p.user);

                            let profile = cached.profile;
                            if(profile) {
                                Object.assign(profile, p.user.profile);
                            } else {
                                cached.profile = p.user.profile;
                            }

                            if(event.o == ServerMsgOpcode.MemberUpdate) {
                                let p = event.p;

                                cached.nick = p.nick || p.user.username;
                                cached.presence = p.presence || cached.presence;
                                cached.roles = p.roles;
                            }

                            if(cached.profile) {
                                cached.bits = split_profile_bits(cached.profile);
                            }
                        }
                    }
                }

                break;
            }
        }
    }
);