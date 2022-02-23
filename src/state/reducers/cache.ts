import produce from "immer";
import { Action, Type } from "state/actions";
import { PartyMember, Snowflake, User, UserPresence } from "state/models";
import { genCachedUserKey } from "state/selectors/selectCachedUser";
import { GatewayMessageDiscriminator } from "worker/gateway/msg";

export interface CachedUser {
    user: User,
    nickname?: string,
    party_id?: Snowflake,
    presence?: UserPresence,
}

export interface ICacheState {
    members: Map<Snowflake, CachedUser>,
}

const DEFAULT_STATE: ICacheState = {
    members: new Map(),
};

export function cacheReducer(state: ICacheState | null | undefined, action: Action): ICacheState {
    state = state || DEFAULT_STATE;

    return state;

    /*
    switch(action.type) {
        case Type.MEMBERS_LOADED: return produce(state, draft => {
            let { members, party_id } = action;

            for(let member of members) {
                let user = member.user;
                if(!user) continue;

                __DEV__ && console.log("SETTING CACHE", user.id, party_id);

                draft.members.set(genCachedUserKey(user.id, party_id), {
                    ...member,
                    user,
                    party_id
                });
            }
        });

        case Type.GATEWAY_EVENT: {
            let msg = action.payload;
            switch(msg.t) {
                case GatewayMessageDiscriminator.Event: {
                    let event = msg.p;

                    switch(event.o) {
                        case GatewayEventCode.PresenceUpdate: {
                            let payload = event.p, user = payload.user;

                            return produce(state, draft => {
                                draft.members.set(genCachedUserKey(user.id, payload.party), payload);
                            });
                        }
                        case GatewayEventCode.MemberUpdate: {
                            let payload = event.p, user = payload.user!;
                            return produce(state, draft => {
                                let key = genCachedUserKey(user.id, payload.party_id);

                                let existing = draft.members.get(key) || {};

                                draft.members.set(key, {
                                    ...existing,
                                    ...payload,
                                    user,
                                });
                            });
                        }

                        default: break;
                    }

                    break;
                }
            }

            break;
        }
    }

    return state;
    */
}