import { Dispatch } from "solid-mutant";

import { IS_MOBILE } from "lib/user_agent";
import { loadMessages, SearchMode, activateParty, setSession } from "state/commands";
import { DEFAULT_LOGGED_IN_CHANNEL, GLOBAL, HISTORY } from "state/global";
import { GatewayStatus } from "state/mutators/gateway";
import { prefsMutator, getPad } from "state/mutators/prefs";
import { Action, RootState, ReadRootState, Type } from "state/root";
import { ServerMsgOpcode } from "state/models";

import { StorageKey } from "state/storage";

import { GatewayCommand, GatewayCommandDiscriminator } from "worker/gateway/cmd";
import { GatewayMessage, GatewayMessageDiscriminator } from "worker/gateway/msg";

import { Font, hasUserPrefFlag, Intent, UserPreferenceFlags, UserPreferences } from "state/models";

import { activeParty, activeRoom } from "state/selectors/active";

import { setTheme } from "lib/theme";
import { displayNotification } from "lib/notification";

const GATEWAY_ENABLED_ROUTES = ['channels', 'settings', 'invite'];

function connect_gateway(state: ReadRootState) {
    GLOBAL.gateway!.postCmd({
        t: GatewayCommandDiscriminator.Connect,
        auth: state.user.session!.auth,
        intent: Intent.ALL,
        //intent: IS_MOBILE ? Intent.ALL_MOBILE : Intent.ALL_DESKTOP
    })
}

export function mainEffect(state: ReadRootState, action: Action, dispatch: Dispatch<Action, RootState>) {
    switch(action.type) {
        case Type.WINDOW_TOGGLE_USER_LIST: {
            localStorage.setItem(StorageKey.SHOW_USER_LIST, JSON.stringify(state.window.show_user_list));
            break;
        }
        case Type.UPDATE_PREFS: {
            let de = document.documentElement,
                prefs = state.prefs,
                { chat_font, ui_font } = prefs,
                pad = getPad(prefs),
                font_changed = false;

            // 16px == 1em, /2 for both sides
            de.style.setProperty('--ln-chat-group-padding', (pad / 32).toFixed(2) + 'em');

            if(chat_font !== undefined) {
                let chat_ff_var = font_to_css(chat_font), chat_ff_key = '--ln-chat-font-family';

                if(de.style.getPropertyValue(chat_ff_key) != chat_ff_var) {
                    de.style.setProperty(chat_ff_key, chat_ff_var);
                    font_changed = true;
                }
            }

            if(typeof prefs.chat_font_size == 'number' || chat_font) {
                let fs = prefs.chat_font_size / 16;

                de.style.setProperty('--ln-chat-font-size', `${fs}rem`);
                de.style.setProperty('--ln-chat-font-size-adjust', `${font_size(chat_font)}`);
            }

            if(ui_font !== undefined) {
                let ui_ff_var = font_to_css(ui_font), ui_ff_key = '--ln-ui-font-family';

                if(de.style.getPropertyValue(ui_ff_key) != ui_ff_var) {
                    de.style.setProperty(ui_ff_key, ui_ff_var);
                    font_changed = true;
                }
            }

            if(typeof prefs.ui_font_size == 'number' || ui_font) {
                let fs = prefs.ui_font_size / 16;

                de.style.setProperty('--ln-ui-font-size', `${fs}rem`);
                de.style.setProperty('--ln-ui-font-size-adjust', `${font_size(ui_font)}em`);
            }

            if(typeof prefs.tab_size == 'number') {
                let ts_var = prefs.tab_size.toString(), ts_key = '--ln-chat-tabsize';

                if(de.style.getPropertyPriority(ts_key) != ts_var) {
                    de.style.setProperty(ts_key, ts_var);
                }
            }

            let reduce_motion = hasUserPrefFlag(prefs, UserPreferenceFlags.ReduceAnimations);
            if(!reduce_motion) {
                de.classList.add('ln-enable-motion');
            } else {
                de.classList.remove('ln-enable-motion');
            }

            // NOTE: Because this runs after the reducers, and the prefs reducer fills in defaults, this is the full prefs
            localStorage.setItem(StorageKey.PREFS, JSON.stringify(prefs));

            break;
        }
    }

    if(!GLOBAL.gateway) {
        return;
    }

    switch(action.type) {
        case Type.SESSION_LOGIN: {
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
            let [channels, party_id, room_id] = state.history.parts;

            if(channels !== 'channels' || party_id != action.party_id) break;

            let room = room_id && action.rooms.find(room => room.id == room_id), chat_room;

            // if there is a room selected, load messages for it
            if(room && room_id) {
                // if chat history of room exists already, try to only load new messages
                // this really only happens on a gateway reconnect, which refreshes the whole party
                // and triggers PARTY_LOADED again
                if(chat_room = state.chat.rooms[room_id]) {
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
            let parts = action.ctx.parts;

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
                        room = room_id && state.chat.rooms[room_id];

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
                    let parts = state.history.parts;
                    // if we get the init after login, connect now
                    if(GATEWAY_ENABLED_ROUTES.includes(parts[0]) && state.user.session) {
                        connect_gateway(state);
                    }
                    break;
                }
                case GatewayMessageDiscriminator.Disconnected: {
                    // if we disconnect but are still on a gateway-enabled location, reconnect automatically
                    if(GATEWAY_ENABLED_ROUTES.includes(state.history.parts[0]) && state.user.session) {
                        connect_gateway(state);
                    }

                    break;
                }
                case GatewayMessageDiscriminator.InvalidSession: {
                    dispatch(setSession(null));
                    break;
                }
                case GatewayMessageDiscriminator.Ready: {
                    let parties = state.party.parties,
                        { active_party, active_room } = state.chat;

                    // Once the gateway is ready, we can signal our presence
                    GLOBAL.gateway.postCmd({ t: GatewayCommandDiscriminator.SetPresence, away: false, mobile: IS_MOBILE });

                    if(active_party && parties[active_party]) {
                        // gateway has connected, so fetch the currently selected party id
                        // this is generally for fresh-loads, but reconnects trigger this as well
                        // so any reconnects will re-activate the selected party, which
                        // will also trigger loading messages/users
                        dispatch(activateParty(active_party, active_room));
                    } else {
                        // TODO: Expand upon this or remove it entirely.
                        if(!['settings', '@me', 'invite'].includes(state.history.parts[0])) {
                            __DEV__ && console.log("Ready event received but no party is active, redirecting to default");
                            HISTORY.replace(DEFAULT_LOGGED_IN_CHANNEL);
                        }
                    }

                    let prefs = msg.p.user.preferences;

                    if(prefs) {
                        let full_prefs = { ...prefsMutator.default(), ...prefs } as UserPreferences;

                        setTheme({
                            temperature: full_prefs.temp,
                            is_light: hasUserPrefFlag(full_prefs, UserPreferenceFlags.LightMode),
                            oled: hasUserPrefFlag(full_prefs, UserPreferenceFlags.OledMode),
                        }, false);

                        dispatch({ type: Type.UPDATE_PREFS, prefs: full_prefs }); // do side-effects
                    }

                    break;
                }
                case GatewayMessageDiscriminator.Event: {
                    let ev = msg.p;
                    switch(ev.o) {
                        case ServerMsgOpcode.MessageCreate: {
                            displayNotification(() => {
                                let notification = new Notification("New Message!");

                                return notification;
                            })
                        }
                    }
                }
            }
            break;
        }
    }
}

function font_to_css(font: Font): string {
    return `var(--ln-font-family-${Font[font].toLowerCase()})`;
}

function font_size(font?: Font): number {
    switch(font || Font.SansSerif) {
        case Font.Cursive: return 1.4;
        case Font.OpenDyslexic: return 0.85;
        default: return 1;
    }
}