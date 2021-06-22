import { Action, Type } from "../actions";

import { User } from "../models";
import { ISession } from "lib/session";
import { GatewayMessageDiscriminator } from "worker/gateway/msg";

export interface IUserState {
    user?: User,
    session?: ISession | null,
}

const DEFAULT_STATE: IUserState = {};

export function userReducer(state: IUserState = DEFAULT_STATE, action: Action) {
    switch(action.type) {
        case Type.UNMOUNT: return DEFAULT_STATE;
        case Type.MOUNT: {
            return { ...state, session: action.payload };
        }
        case Type.GATEWAY_EVENT: {
            if(action.payload.t == GatewayMessageDiscriminator.Ready) {
                return { ...state, user: action.payload.p.user };
            }
        }
    }

    return state;
}