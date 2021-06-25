import { Middleware } from "redux";

import { Dispatch } from "state/actions";
import { GLOBAL } from "state/global";
import { GatewayStatus } from "state/reducers/gateway";
import { Action, RootState, Type } from "state/root";
import { GatewayCommandDiscriminator } from "worker/gateway/cmd";
import { GatewayMessage, GatewayMessageDiscriminator } from "worker/gateway/msg";

export const gatewayMiddleware: Middleware<{}, RootState, Dispatch> = ({ dispatch, getState }) => next => (action: Action) => {
    // run reducers first
    let res = next(action);

    if(!GLOBAL.gateway) {
        return res;
    }

    switch(action.type) {
        case Type.SESSION_LOGIN: {
            let state = getState();

            // if we get the login after init, connect now
            if(state.gateway.status == GatewayStatus.Initialized && state.user.session) {
                GLOBAL.gateway.postMessage({
                    t: GatewayCommandDiscriminator.Connect,
                    auth: state.user.session.auth
                });
            }

            break;
        }
        case Type.SESSION_EXPIRED: {
            GLOBAL.gateway.postMessage({ t: GatewayCommandDiscriminator.Disconnect });
            break;
        }
        case Type.GATEWAY_EVENT: {
            let msg: GatewayMessage = action.payload;
            switch(msg.t) {
                case GatewayMessageDiscriminator.Initialized: {
                    let state = getState();
                    // if we get the init after login, connect now
                    if(state.user.session) {
                        GLOBAL.gateway.postMessage({
                            t: GatewayCommandDiscriminator.Connect,
                            auth: state.user.session.auth
                        });
                    }
                }
            }
            break;
        }
    }

    return res;
}