import { Middleware } from "redux";

import { IS_MOBILE } from "lib/user_agent";
import { Dispatch } from "state/actions";
import { loadMessages, SearchMode, activateParty, setSession } from "state/commands";
import { DEFAULT_LOGGED_IN_CHANNEL, GLOBAL, HISTORY } from "state/global";
import { GatewayStatus } from "state/reducers/gateway";
import { DEFAULT_STATE as DEFAULT_PREFS } from "state/reducers/prefs";
import { Action, RootState, Type } from "state/root";

import { StorageKey } from "state/storage";

import { GatewayCommand, GatewayCommandDiscriminator } from "worker/gateway/cmd";
import { GatewayMessage, GatewayMessageDiscriminator } from "worker/gateway/msg";

import { Font, Intent, UserPreferences } from "state/models";

import { room_url } from "config/urls";
import { activeParty, activeRoom } from "state/selectors/active";

import { setTheme } from "lib/theme";

const GATEWAY_ENABLED_ROUTES = ['channels', 'settings', 'invite'];

function connect_gateway(state: RootState) {
    GLOBAL.gateway!.postCmd({
        t: GatewayCommandDiscriminator.Connect,
        auth: state.user.session!.auth,
        intent: Intent.ALL_DESKTOP,
        //intent: IS_MOBILE ? Intent.ALL_MOBILE : Intent.ALL_DESKTOP
    })
}

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
                connect_gateway(state);
            }

            break;
        }
        case Type.SESSION_EXPIRED: {
            GLOBAL.gateway.postCmd({ t: GatewayCommandDiscriminator.Disconnect });
            break;
        }
        case Type.PARTY_LOADED: {
            let state = getState(),
                [channels, party_id, room_id] = state.history.parts;

            if(channels !== 'channels' || party_id != action.party_id) break;

            let room = room_id && action.rooms.find(room => room.id == room_id), chat_room;

            // if there is a room selected, load messages for it
            if(room && room_id) {
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

            if(!GATEWAY_ENABLED_ROUTES.includes(parts[0])) {
                // if the history updated and we're now on a page that doesn't need the gateway, disconnect
                GLOBAL.gateway.postCmd({ t: GatewayCommandDiscriminator.Disconnect });
            } else {
                const CONNECTABLE = [GatewayStatus.Disconnected, GatewayStatus.Initialized];

                if(CONNECTABLE.includes(state.gateway.status) && state.user.session) {
                    // if the history updated and we're now on a page that needs the gateway, connect
                    connect_gateway(state);
                } else {
                    // if the history updated and gateway is good, load
                    // any new messages for the now-active channel
                    let room_id = activeRoom(state),
                        room = room_id && state.chat.rooms.get(room_id);

                    if(room) {
                        let last_msg = room.msgs[room.msgs.length - 1];
                        let last_msg_id = last_msg != null ? last_msg.msg.id : undefined;

                        dispatch(loadMessages(room.room.id, last_msg_id, SearchMode.After));
                    }
                }
            }

            break;
        }
        case Type.GATEWAY_RETRY: {
            let state = getState();

            const CAN_RETRY_STATUSES = [GatewayStatus.Waiting, GatewayStatus.Errored];

            // If the user requests a gateway connection retry, send the connect command
            if(CAN_RETRY_STATUSES.includes(state.gateway.status) && state.user.session) {
                connect_gateway(state);
            }

            break;
        }
        case Type.GATEWAY_EVENT: {
            let msg: GatewayMessage = action.payload;
            switch(msg.t) {
                case GatewayMessageDiscriminator.Initialized: {
                    let state = getState(), parts = state.history.parts;
                    // if we get the init after login, connect now
                    if(GATEWAY_ENABLED_ROUTES.includes(parts[0]) && state.user.session) {
                        connect_gateway(state);
                    }
                    break;
                }
                case GatewayMessageDiscriminator.Disconnected: {
                    let state = getState();

                    // if we disconnect but are still on a gateway-enabled location, reconnect automatically
                    if(GATEWAY_ENABLED_ROUTES.includes(state.history.parts[0]) && state.user.session) {
                        connect_gateway(state);
                    }

                    break;
                }
                case GatewayMessageDiscriminator.Ready: {
                    let state = getState(),
                        parties = state.party.parties,
                        party_id = activeParty(state);

                    GLOBAL.gateway.postCmd({ t: GatewayCommandDiscriminator.SetPresence, away: false });

                    if(party_id && parties.has(party_id)) {
                        // gateway has connected, so fetch the currently selected party id
                        // this is generally for fresh-loads, but reconnects trigger this as well
                        // so any reconnects will re-activate the selected party, which
                        // will also trigger loading messages/users
                        dispatch(activateParty(party_id));
                    } else {
                        __DEV__ && console.log("Ready event received but no party is active, redirecting to default");

                        HISTORY.replace(DEFAULT_LOGGED_IN_CHANNEL);
                    }

                    let prefs = msg.p.user.preferences;

                    if(prefs) {
                        let full_prefs = { ...DEFAULT_PREFS, ...prefs } as UserPreferences;

                        localStorage.setItem(StorageKey.PREFS, JSON.stringify(full_prefs));

                        setTheme({ temperature: full_prefs.temp, is_light: full_prefs.light }, false);
                        dispatch({ type: Type.UPDATE_PREFS, prefs: full_prefs });
                    }

                    break;
                }
                case GatewayMessageDiscriminator.InvalidSession: {
                    dispatch(setSession(null));
                    break;
                }
            }
            break;
        }
        case Type.WINDOW_TOGGLE_USER_LIST_SIDEBAR: {
            let w = getState().window;
            if(!w.use_mobile_view) {
                localStorage.setItem(StorageKey.SHOW_USER_LIST, JSON.stringify(w.show_user_list));
            }
            break;
        }
        case Type.UPDATE_PREFS: {
            let de = document.documentElement, { chat_font, ui_font } = action.prefs, changed = false;

            if(chat_font) {
                let chat_ff_var = font_to_css(chat_font), chat_ff_key = '--ln-chat-font-family';

                if(de.style.getPropertyValue(chat_ff_key) != chat_ff_var) {
                    de.style.setProperty(chat_ff_key, chat_ff_var);
                    changed = true;
                }
            }

            if(ui_font) {
                let ui_ff_var = font_to_css(ui_font), ui_ff_key = '--ln-ui-font-family';

                if(de.style.getPropertyValue(ui_ff_key) != ui_ff_var) {
                    de.style.setProperty(ui_ff_key, ui_ff_var);
                    changed = true;
                }
            }

            if(changed && [chat_font, ui_font].includes(Font.OpenDyslexic)) {
                import("ui/fonts/opendyslexic");
            }
        }
    }

    return res;
}

function font_to_css(font: Font): string {
    let suffix = (() => {
        switch(font) {
            case Font.Cursive: return 'cursive';
            case Font.Serif: return 'serif';
            case Font.Monospace: return 'monospace';
            case Font.OpenDyslexic: return 'opendyslexic';
            case Font.SansSerif: return 'sansserif';
        }
    })();

    return `var(--ln-font-family-${suffix}`;
}