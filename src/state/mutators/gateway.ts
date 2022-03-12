import { mutatorWithDefault } from "solid-mutant";
import { Action, Type } from "../actions";

export const enum GatewayStatus {
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

import { GatewayMessage, GatewayMessageDiscriminator } from "worker/gateway/msg";

export const gatewayMutator = mutatorWithDefault(
    () => ({ status: GatewayStatus.Unknown }),
    (state: IGatewayState, action: Action) => {
        switch(action.type) {
            case Type.SESSION_EXPIRED: {
                state.status = state.status == GatewayStatus.Unknown ? GatewayStatus.Unknown : GatewayStatus.Initialized;
                break;
            }
            case Type.GATEWAY_EVENT: {
                let msg: GatewayMessage = action.payload;
                switch(msg.t) {
                    case GatewayMessageDiscriminator.Initialized: {
                        state.status = GatewayStatus.Initialized;
                        break;
                    }
                    case GatewayMessageDiscriminator.Connecting: {
                        state.status = GatewayStatus.Connecting;
                        state.waiting = undefined;
                        break;
                    }
                    case GatewayMessageDiscriminator.Connected: {
                        state.status = GatewayStatus.Connected;
                        state.waiting = undefined;
                        break;
                    }
                    case GatewayMessageDiscriminator.Waiting: {
                        state.status = GatewayStatus.Waiting
                        state.waiting = new Date(msg.p);
                        break;
                    }
                    //case GatewayMessageDiscriminator.Message: {
                    //
                    //}
                }
            }
        }
    }
);