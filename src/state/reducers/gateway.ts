import { ISession } from "lib/session";

import { Action, Type } from "../actions";
import { GLOBAL } from "state/global";


export enum GatewayStatus {
    Unknown,
    Initialized,
    Connected,
    Disconnected,
    Errored,
}

export interface IGatewayState {
    status: GatewayStatus,
}

const DEFAULT_STATE: IGatewayState = {
    status: GatewayStatus.Unknown,
};

import { GatewayMessage, GatewayMessageDiscriminator } from "worker/gateway/msg";
import { GatewayCommandDiscriminator } from "worker/gateway/cmd";

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
                case GatewayMessageDiscriminator.Connected: {
                    return { ...state, status: GatewayStatus.Connected };
                }
                //case GatewayMessageDiscriminator.Message: {
                //
                //}
            }
        }
    }

    return state;
}