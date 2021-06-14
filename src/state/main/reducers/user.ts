import { Action, Type } from "../actions";

import { User } from "../models";
import { ISession } from "lib/session";

export interface IUserState {
    user?: User,
    session?: ISession,
}

const DEFAULT_STATE: IUserState = {};

export function userReducer(state: IUserState = DEFAULT_STATE, action: Action) {
    switch(action.type) {
        case Type.UNMOUNT: return DEFAULT_STATE;
        case Type.MOUNT: {
            return { ...state, session: action.payload };
        }
        // TODO: Ready event
    }

    return state;
}