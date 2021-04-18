import { ISession } from "lib/session";

enum GatewayStatus {
    Unknown = 0,
    Initialized,
    Connected,
    Identified,
    Disconnected,
    Errored,
}

export interface IGatewayState {
    status: GatewayStatus,
    session: ISession | null,
}

const DEFAULT_STATE: IGatewayState = {
    status: GatewayStatus.Unknown,
    session: null,
};

export interface GatewayAction {
    type: string,
    payload: any,
}

import { GATEWAY } from "ui/views/main";
import { GatewayMessage, GatewayMessageDiscriminator } from "worker/gateway/msg";
import { GatewayCommandDiscriminator } from "worker/gateway/cmd";

export function gatewayReducer(state: IGatewayState = DEFAULT_STATE, action: GatewayAction): IGatewayState {

    console.log(action.type);
    switch(action.type) {
        case 'MOUNT': {
            if(state.status == GatewayStatus.Initialized) {
                GATEWAY.postMessage({ t: GatewayCommandDiscriminator.Connect });
            }
            return { ...state, session: action.payload };
        }
        case 'UNMOUNT': {
            GATEWAY.postMessage({ t: GatewayCommandDiscriminator.Disconnect });
            return DEFAULT_STATE
        }
        case 'GATEWAY_MESSAGE': {
            let msg: GatewayMessage = action.payload;
            switch(msg.t) {
                case GatewayMessageDiscriminator.Initialized: {
                    GATEWAY.postMessage({ t: GatewayCommandDiscriminator.Connect });
                    return { ...state, status: GatewayStatus.Initialized };
                }
                case GatewayMessageDiscriminator.Connected: {
                    state = { ...state, status: GatewayStatus.Connected };
                    if(state.session !== null) {
                        GATEWAY.postMessage({ t: GatewayCommandDiscriminator.Identify, p: state.session.auth });
                    } else {
                        GATEWAY.postMessage({ t: GatewayCommandDiscriminator.Disconnect });
                    }
                    return state;
                }
            }
        }
    }

    return state;
}