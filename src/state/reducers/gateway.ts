import { ISession } from "lib/session";

import { Action, Type } from "../actions";
import { GLOBAL } from "state/global";


enum GatewayStatus {
    Unknown,
    Initialized,
    Connected,
    Disconnected,
    Errored,
}

export interface IGatewayState {
    status: GatewayStatus,
    session?: ISession,
}

const DEFAULT_STATE: IGatewayState = {
    status: GatewayStatus.Unknown,
};

import { GatewayMessage, GatewayMessageDiscriminator } from "worker/gateway/msg";
import { GatewayCommandDiscriminator } from "worker/gateway/cmd";

export function gatewayReducer(state: IGatewayState | null | undefined, action: Action): IGatewayState {
    state = state || DEFAULT_STATE;

    switch(action.type) {
        case Type.SESSION_LOGIN: {
            state = { ...state, session: action.session };
            // if we get the mount after init, connect now
            if(state.status == GatewayStatus.Initialized) {
                GLOBAL.gateway!.postMessage({
                    t: GatewayCommandDiscriminator.Connect,
                    auth: action.session.auth
                });
            }
            return state;
        }
        case Type.SESSION_EXPIRED: {
            GLOBAL.gateway!.postMessage({ t: GatewayCommandDiscriminator.Disconnect });

            return { status: state.status == GatewayStatus.Unknown ? GatewayStatus.Unknown : GatewayStatus.Initialized };
        }
        case Type.GATEWAY_EVENT: {
            let msg: GatewayMessage = action.payload;
            switch(msg.t) {
                case GatewayMessageDiscriminator.Initialized: {
                    // if we get the init after mount, connect now
                    if(state.session) {
                        GLOBAL.gateway!.postMessage({
                            t: GatewayCommandDiscriminator.Connect,
                            auth: state.session.auth
                        });
                    }
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