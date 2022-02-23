import { Action, Type } from "../actions";

import { ServerMsgOpcode, User, UserPresence } from "../models";
import { ISession } from "lib/session";
import { GatewayMessageDiscriminator } from "worker/gateway/msg";

export interface IUserState {
    user?: User,
    session?: ISession | null,
    friends?: User[],
    presence?: UserPresence,
    quota_used?: number,
    quota_total?: number,
}

export const DEFAULT_STATE: IUserState = {};

export function userReducer(state: IUserState = DEFAULT_STATE, action: Action) {
    switch(action.type) {
        case Type.SESSION_EXPIRED: return DEFAULT_STATE;
        case Type.UPDATE_QUOTA: {
            return {
                ...state,
                quota_used: action.quota_used,
                quota_total: action.quota_total,
            };
        }
        case Type.GATEWAY_EVENT: {
            switch(action.payload.t) {
                case GatewayMessageDiscriminator.Ready: {
                    // Initialize the user with `online` presence to start with
                    // TODO: Improve this
                    return { ...state, user: action.payload.p.user, presence: { flags: 1 } };
                }
                case GatewayMessageDiscriminator.Event: {
                    if(!state.user) break;

                    let p = action.payload.p;

                    switch(p.o) {
                        case ServerMsgOpcode.PresenceUpdate: {
                            if(p.p.user.id == state.user.id) {
                                return { ...state, presence: p.p.presence };
                            }

                            break;
                        }
                        case ServerMsgOpcode.UserUpdate: {
                            let user = p.p.user;

                            // overwrite own user info if same user and has private fields present
                            // indicating it's meant for us
                            if(user.id == state.user!.id && user.email) {
                                return { ...state, user };
                            }

                            break;
                        }
                    }

                    break;
                }
            }
            break;
        }
        case Type.SESSION_LOGIN: {
            return { ...state, session: action.session };
        }
    }

    return state;
}