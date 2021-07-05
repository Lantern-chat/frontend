import { Middleware } from "redux";

import { Dispatch } from "state/actions";
import { loadMessages, SearchMode, activateParty } from "state/commands";
import { DEFAULT_LOGGED_IN_CHANNEL, GLOBAL, HISTORY } from "state/global";
import { GatewayStatus } from "state/reducers/gateway";
import { Action, RootState, Type } from "state/root";
import { GatewayCommandDiscriminator } from "worker/gateway/cmd";
import { GatewayMessage, GatewayMessageDiscriminator } from "worker/gateway/msg";

const GATEWAY_ENABLED_ROUTES = ['channels', 'profile', 'invite'];

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
        case Type.PARTY_LOADED: {
            let state = getState(),
                room_id = state.history.parts[2],
                room = action.rooms.find(room => room.id == room_id), chat_room;

            // if there is a room selected, load messages for it
            if(room) {
                // if chat history of room exists already, try to only load new messages
                // this really only happens on a gateway reconnect, which refreshes the whole party
                // and triggers PARTY_LOADED again
                if(chat_room = state.chat.rooms.get(room_id)) {
                    let msgs = chat_room.msgs;
                    if(msgs.length > 0) {
                        dispatch(loadMessages(room_id, msgs[msgs.length - 1].msg.id));
                        break;
                    }
                }

                dispatch(loadMessages(room.id));
            }

            break;
        }
        case Type.HISTORY_UPDATE: {
            let state = getState(),
                parts = action.ctx.parts;

            if(GATEWAY_ENABLED_ROUTES.indexOf(parts[0]) < 0) {
                // if the history updated and we're now on a page that doesn't need the gateway, disconnect
                GLOBAL.gateway.postMessage({ t: GatewayCommandDiscriminator.Disconnect });
            } else {
                const CONNECTABLE = [GatewayStatus.Disconnected, GatewayStatus.Initialized];

                if(CONNECTABLE.indexOf(state.gateway.status) >= 0 && state.user.session) {
                    // if the history updated and we're now on a page that needs the gateway, connect
                    GLOBAL.gateway.postMessage({
                        t: GatewayCommandDiscriminator.Connect,
                        auth: state.user.session.auth
                    });
                } else {
                    // if the history updated and gateway is good, load
                    // any new messages for the now-active channel
                    let room_id = parts[2],
                        room = state.chat.rooms.get(room_id);

                    if(room) {
                        let last_msg = room.msgs[room.msgs.length - 1];
                        let last_msg_id = last_msg != null ? last_msg.msg.id : undefined;

                        dispatch(loadMessages(room_id, last_msg_id, SearchMode.After));
                    }
                }
            }

            break;
        }
        case Type.GATEWAY_RETRY: {
            let state = getState();

            const CAN_RETRY_STATUSES = [GatewayStatus.Waiting, GatewayStatus.Errored];

            // If the user requests a gateway connection retry, send the connect command
            if(CAN_RETRY_STATUSES.indexOf(state.gateway.status) >= 0 && state.user.session) {
                GLOBAL.gateway.postMessage({
                    t: GatewayCommandDiscriminator.Connect,
                    auth: state.user.session.auth
                });
            }

            break;
        }
        case Type.GATEWAY_EVENT: {
            let msg: GatewayMessage = action.payload;
            switch(msg.t) {
                case GatewayMessageDiscriminator.Initialized: {
                    let state = getState(), parts = state.history.parts;
                    // if we get the init after login, connect now
                    if(GATEWAY_ENABLED_ROUTES.indexOf(parts[0]) >= 0 && state.user.session) {
                        GLOBAL.gateway.postMessage({
                            t: GatewayCommandDiscriminator.Connect,
                            auth: state.user.session.auth
                        });
                    }
                    break;
                }
                case GatewayMessageDiscriminator.Disconnected: {
                    let state = getState();

                    // if we disconnect but are still on a gateway-enabled location, reconnect automatically
                    if(GATEWAY_ENABLED_ROUTES.indexOf(state.history.parts[0]) >= 0 && state.user.session) {
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
                        // gateway has connected, so fetch the currently selected party id
                        // this is generally for fresh-loads, but reconnects trigger this as well
                        // so any reconnects will re-activate the selected party, which
                        // will also trigger loading messages/users
                        dispatch(activateParty(party_id));
                    } else {
                        __DEV__ && console.log("Ready event received but no party is active, redirecting to default");

                        HISTORY.replace(DEFAULT_LOGGED_IN_CHANNEL);
                    }

                    break;
                }
            }
            break;
        }
        case Type.WINDOW_TOGGLE_USER_LIST_SIDEBAR: {
            let w = getState().window;
            if(!w.use_mobile_view) {
                localStorage.setItem('SHOW_USER_LIST', JSON.stringify(w.show_user_list));
            }
            break;
        }
    }

    return res;
}