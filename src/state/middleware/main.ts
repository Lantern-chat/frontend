import { Middleware } from "redux";

import { Dispatch } from "state/actions";
import { loadMessages, SearchMode } from "state/action_creators/load_msgs";
import { activateParty } from "state/action_creators/party";
import { GLOBAL, HISTORY } from "state/global";
import { GatewayStatus } from "state/reducers/gateway";
import { Action, RootState, Type } from "state/root";
import { GatewayCommandDiscriminator } from "worker/gateway/cmd";
import { GatewayMessage, GatewayMessageDiscriminator } from "worker/gateway/msg";

export const mainMiddleware: Middleware<{}, RootState, Dispatch> = ({ dispatch, getState }) => next => (action: Action) => {
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
        case Type.ROOMS_LOADED: {
            let state = getState(),
                channel_id = state.history.parts[2],
                room = action.rooms.find(room => room.id == channel_id);

            if(room) { dispatch(loadMessages(channel_id)); }

            break;
        }
        case Type.HISTORY_UPDATE: {
            let state = getState(),
                channel_id = action.ctx.parts[2],
                room = state.chat.rooms.get(channel_id);

            if(room) {
                let last_msg = room.msgs[room.msgs.length - 1];
                let last_msg_id = last_msg != null ? last_msg.msg.id : undefined;

                dispatch(loadMessages(channel_id, 100, last_msg_id, SearchMode.After));
            }

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
                    break;
                }
                case GatewayMessageDiscriminator.Ready: {
                    let state = getState(), parties = state.party.parties, party_id = state.history.parts[1];

                    if(parties.has(party_id)) {
                        dispatch(activateParty(party_id));
                    } else {
                        HISTORY.replace('/channels/@me');
                    }

                    break;
                }
            }
            break;
        }
    }

    return res;
}