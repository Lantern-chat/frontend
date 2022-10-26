import { PartyMemberEvent, UserPresenceUpdateEvent } from "client-sdk/src/models/gateway";
import { Action, Type } from "state/actions";
import { Message, PartyMember, ServerMsgOpcode, Snowflake, split_profile_bits, User, UserPresence, UserProfile, UserProfileSplitBits } from "state/models";
import { RootState } from "state/root";
import { merge } from "state/util";
import { GatewayMessageDiscriminator } from "worker/gateway/msg";

export interface CachedUser {
    user: User,
    nick: string,
    party_id?: Snowflake,
    roles?: Snowflake[],
    presence?: UserPresence,
    profile?: UserProfile | null,
    bits: UserProfileSplitBits,
}

export interface ICacheState {
    users: Record<Snowflake, CachedUser>,
}

export function cache_key(user_id: Snowflake, party_id?: Snowflake): string {
    return (party_id && party_id != '@me') ? (party_id + '_' + user_id) : user_id;
}

export const DEFAULT_PROFILE_BITS: UserProfileSplitBits = {
    roundedness: 0,
    override_color: false,
    color: 0,
}

export function cacheMutator(root: RootState, action: Action) {
    let cache = root.cache;
    if(!cache) {
        cache = root.cache = { users: {} };
    }

    switch(action.type) {
        case Type.CACHE_USER: {
            let cached = action.cached;

            let key = cache_key(cached.user.id, cached.party_id);
            merge(cache.users, key, cached);
            __DEV__ && console.log("Cached", key);

            break;
        }
        case Type.PROFILE_FETCHED: {
            let { user_id, party_id, profile } = action,
                key = cache_key(user_id, party_id),
                cached: CachedUser | undefined = cache.users[key];

            if(cached) {
                merge(cached, 'profile', profile);
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
                case ServerMsgOpcode.Ready: {
                    let user = event.p.user;

                    let cached_user = cache.users[user.id] = {
                        user,
                        nick: user.profile?.nick || user.username,
                        profile: user.profile,
                        bits: user.profile ? split_profile_bits(user.profile) : DEFAULT_PROFILE_BITS,
                    };

                    for(let party of event.p.parties) {
                        cache.users[cache_key(user.id, party.id)] = cached_user;
                    }

                    break;
                }
                case ServerMsgOpcode.MessageCreate:
                case ServerMsgOpcode.MessageUpdate:
                case ServerMsgOpcode.PresenceUpdate:
                case ServerMsgOpcode.UserUpdate:
                case ServerMsgOpcode.MemberAdd:
                case ServerMsgOpcode.MemberRemove:
                case ServerMsgOpcode.MemberUpdate: {
                    let p = event.p,
                        user = (p as Message).author || (p as UserPresenceUpdateEvent).user,
                        key = cache_key(user.id, (p as PartyMemberEvent | Message).party_id),
                        cached = cache.users[key];

                    if(cached) {
                        merge(cached, 'user', user);

                        // will only be truly null if there is no profile whatsoever
                        if(user.profile === null) {
                            cached.profile = null;
                        } else {
                            merge(cached, 'profile', user.profile);
                        }

                        cached.nick = user.profile?.nick || user.username;

                        // any member events should also update cache parts
                        switch(event.o) {
                            case ServerMsgOpcode.MemberAdd:
                            case ServerMsgOpcode.MemberUpdate:
                            //@ts-ignore fallthrough
                            case ServerMsgOpcode.MemberRemove: {
                                cached.roles = event.p.roles;
                            }
                            case ServerMsgOpcode.PresenceUpdate: {
                                cached.presence = event.p.presence || cached.presence;
                            }
                        }

                        if(cached.profile) {
                            cached.bits = split_profile_bits(cached.profile);
                        }
                    }

                    break;
                }
            }

            break;
        }
    }
}