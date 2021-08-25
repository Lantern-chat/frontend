import produce from "immer";
import { Action, Type } from "state/actions";
import { PartyMember, Snowflake, User, UserPresence } from "state/models";
import { GatewayEventCode } from "worker/gateway/event";
import { GatewayMessageDiscriminator } from "worker/gateway/msg";

export interface CachedUserPresence {
    user: User,
    party?: Snowflake,
    presence: UserPresence,
}

export interface CachedMember {
    nickname?: string,
}

export interface ICacheState {
    users: Map<Snowflake, CachedUserPresence>,
    members: Map<Snowflake, CachedMember>,
}

const DEFAULT_STATE: ICacheState = {
    users: new Map(),
    members: new Map(),
};

export function cacheReducer(state: ICacheState | null | undefined, action: Action): ICacheState {
    state = state || DEFAULT_STATE;

    switch(action.type) {
        case Type.GATEWAY_EVENT: {
            let msg = action.payload;
            switch(msg.t) {
                case GatewayMessageDiscriminator.Event: {
                    let event = msg.p;

                    switch(event.o) {
                        case GatewayEventCode.PresenceUpdate: {
                            let payload = event.p, user = payload.user;

                            return produce(state, draft => {
                                draft.users.set(payload.party ? (user.id + payload.party) : user.id, payload);
                            });
                        }
                        //case GatewayEventCode.MemberUpdate: {
                        //    //TODO:
                        //}

                        default: break;
                    }

                    break;
                }
            }

            break;
        }
    }

    return state;
}