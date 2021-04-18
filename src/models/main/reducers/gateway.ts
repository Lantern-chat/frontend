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
import { GatewayCommandType, GatewayWorkerMessage, GatewayMessageType } from "worker/gateway/types";

export function gatewayReducer(state: IGatewayState = DEFAULT_STATE, action: GatewayAction): IGatewayState {

    console.log(action.type);
    switch(action.type) {
        case 'MOUNT': {
            if(state.status == GatewayStatus.Initialized) {
                GATEWAY.postMessage({ t: GatewayCommandType.Connect });
            }
            return { ...state, session: action.payload };
        }
        case 'UNMOUNT': {
            GATEWAY.postMessage({ t: GatewayCommandType.Disconnect });
            return DEFAULT_STATE
        }
        case 'GATEWAY_MESSAGE': {
            let msg: GatewayWorkerMessage = action.payload;
            switch(msg.t) {
                case GatewayMessageType.Initialized: {
                    GATEWAY.postMessage({ t: GatewayCommandType.Connect });
                    return { ...state, status: GatewayStatus.Initialized };
                }
                case GatewayMessageType.Connected: {
                    state = { ...state, status: GatewayStatus.Connected };
                    if(state.session !== null) {
                        GATEWAY.postMessage({ t: GatewayCommandType.Identify, p: state.session.auth });
                    } else {
                        GATEWAY.postMessage({ t: GatewayCommandType.Disconnect });
                    }
                    return state;
                }
            }
        }
    }

    return state;
}