import { Action, Type } from "../actions";

import { User } from "../models";
import { ISession } from "lib/session";
import { GatewayMessageDiscriminator } from "worker/gateway/msg";

export interface IUserState {
    user?: User,
    session?: ISession | null,
    friends?: User[],
    presence: 'away' | 'online'
}

export const DEFAULT_STATE: IUserState = {
    presence: 'online'
};

export function userReducer(state: IUserState = DEFAULT_STATE, action: Action) {
    switch(action.type) {
        case Type.SESSION_EXPIRED: return DEFAULT_STATE;
        case Type.GATEWAY_EVENT: {
            if(action.payload.t == GatewayMessageDiscriminator.Ready) {
                return { ...state, user: action.payload.p.user };
            }
            break;
        }
        case Type.SESSION_LOGIN: {
            return { ...state, session: action.session };
        }
    }

    return state;
}