import { ISession } from "lib/session";

import { Action, Type } from "../actions";
import { GLOBAL } from "state/global";


export enum GatewayStatus {
    Unknown,
    Initialized,
    Connecting,
    Waiting,
    Connected,
    Disconnected,
    Errored,
}

export interface IGatewayState {
    status: GatewayStatus,
    waiting?: Date,
}

const DEFAULT_STATE: IGatewayState = {
    status: GatewayStatus.Unknown,
};

import { GatewayMessage, GatewayMessageDiscriminator } from "worker/gateway/msg";

export function gatewayReducer(state: IGatewayState | null | undefined, action: Action): IGatewayState {
    state = state || DEFAULT_STATE;

    switch(action.type) {
        case Type.SESSION_EXPIRED: {
            return { status: state.status == GatewayStatus.Unknown ? GatewayStatus.Unknown : GatewayStatus.Initialized };
        }
        case Type.GATEWAY_EVENT: {
            let msg: GatewayMessage = action.payload;
            switch(msg.t) {
                case GatewayMessageDiscriminator.Initialized: {
                    return { ...state, status: GatewayStatus.Initialized };
                }
                case GatewayMessageDiscriminator.Connecting: {
                    return { ...state, status: GatewayStatus.Connecting, waiting: undefined };
                }
                case GatewayMessageDiscriminator.Connected: {
                    return { ...state, status: GatewayStatus.Connected, waiting: undefined };
                }
                case GatewayMessageDiscriminator.Waiting: {
                    return { ...state, status: GatewayStatus.Waiting, waiting: new Date(msg.p) }
                }
                //case GatewayMessageDiscriminator.Message: {
                //
                //}
            }
        }
    }

    return state;
}