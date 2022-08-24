import { createEffect, onCleanup, Show } from "solid-js";
import throttle from 'lodash/throttle';

import { Action, useRootDispatch, useRootSelector } from "state/root";
import { mainMutator, Type } from "state/main";
import { GLOBAL, STORE, HISTORY, type IGatewayWorker } from "state/global";
import { mainEffect } from "state/effects/main";
import type { IHistoryState } from 'state/mutators';
import type { ISession } from 'lib/session';

if(!GLOBAL.patched_main) {
    STORE.replaceEffect(mainEffect);
    STORE.replaceMutator(mainMutator);

    GLOBAL.patched_main = true;

    let state = STORE.state, session = state.user.session;

    let actions: Action[] = [
        { type: Type.REFRESH_ACTIVE, ctx: state.history as IHistoryState },
        { type: Type.UPDATE_PREFS, prefs: {} }
    ];

    if(session) {
        // if there is an existing session, fire off the login again to refresh parts of the state
        actions.push({ type: Type.SESSION_LOGIN, session: session as ISession })
    } else {
        // otherwise, main view should never have been loaded so redirect to login
        HISTORY.replace('/login');
    }

    STORE.dispatch(actions); // batched
}

import type { GatewayCommand } from "worker/gateway/cmd";
import Gateway from "worker-loader!worker/gateway";

// this script may be run multiple times if unlucky,
// so double-check the gateway hasn't already been created
if(!GLOBAL.gateway) {
    let gateway: any = new Gateway();
    gateway.postCmd = (cmd: GatewayCommand) => gateway.postMessage(cmd);
    GLOBAL.gateway = gateway as IGatewayWorker;

    GLOBAL.gateway.addEventListener('message', msg => {
        let data = msg.data;
        if(typeof data === 'string') {
            data = JSON.parse(data);
        }
        if(typeof data.p === 'string') {
            data.p = JSON.parse(data.p);
        }
        STORE.dispatch({ type: Type.GATEWAY_EVENT, payload: data });
    });
}

import { setPresence } from "state/commands/presence";

import { Hotkey, IMainContext, MainContext, OnClickHandler, OnKeyHandler, parseHotkey, useMainHotkey } from "ui/hooks/useMain";
import { TimeProvider } from "ui/hooks/createTimestamp";

import { createRef } from "ui/hooks/createRef";
import { Panel } from "state/mutators/window";
import { PartyList } from "./components/party_list";
import { Party } from "./components/party/party";
import MainModals from "./modals";

//import { themeSelector } from "state/selectors/theme";
//import { setTheme } from "state/commands/theme";
//import { savePrefs, savePrefsFlag } from "state/commands/prefs";
//import { UserPreferenceFlags } from "state/models";
//function SetupMainHotkeyHandler() {
//    let dispatch = useRootDispatch();
//
//    useMainHotkey(Hotkey.ToggleLightTheme, () => dispatch((dispatch, state) => {
//        let { temperature, is_light, oled } = themeSelector(state);
//
//        is_light = !is_light;
//
//        dispatch(setTheme(temperature, is_light, oled));
//        dispatch(savePrefs({ temp: temperature }));
//        dispatch(savePrefsFlag(UserPreferenceFlags.LightMode, is_light));
//    }));
//}

import "./main.scss";
export default function Main() {
    let dispatch = useRootDispatch();

    /// AWAY/ONLINE PRESENCE SETUP

    let w = window, away_timer: number, set_away = () => dispatch(setPresence(true));
    let activity_events = ['mousemove', 'keydown', 'touchstart'];

    let away_listener = throttle(() => {
        dispatch(setPresence(false));
        clearTimeout(away_timer)
        away_timer = setTimeout(set_away, 1000 * 60 * 10); // 10 minutes
    }, 1000);

    activity_events.forEach(e => w.addEventListener(e, away_listener));
    onCleanup(() => { activity_events.forEach(e => w.removeEventListener(e, away_listener)); clearTimeout(away_timer) });

    /// MAIN CONTEXT SETUP

    let click_listeners: OnClickHandler[] = [];
    let key_listeners: { [key: number]: OnKeyHandler[] } = {};

    let addOnClick = (listener: OnClickHandler) => {
        click_listeners.push(listener);
    };

    let addOnHotkey = (hotkey: Hotkey, listener: OnKeyHandler) => {
        let listeners = key_listeners[hotkey];
        if(!listeners) {
            listeners = key_listeners[hotkey] = [];
        }
        listeners.push(listener);
    };

    let removeOnClick = (listener: OnClickHandler) => {
        click_listeners = click_listeners.filter(l => l != listener);
    };

    let removeOnHotkey = (hotkey: Hotkey, listener: OnKeyHandler) => {
        let listeners;
        if(listeners = key_listeners[hotkey]) {
            key_listeners[hotkey] = listeners.filter(l => l != listener);
        }
    };

    let clickAll = (e: MouseEvent) => {
        //__DEV__ && console.log(click_listeners);

        for(let listener of click_listeners) {
            listener(e);
        }
    };

    let triggerHotkey = (hotkey: Hotkey, e: KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();

        let listeners = key_listeners[hotkey];
        if(listeners) {
            for(let listener of listeners) {
                listener(e);
            }
        }
    };

    let triggerAnyHotkey = (e: KeyboardEvent) => {
        let hotkey = parseHotkey(e);
        if(hotkey) { triggerHotkey(hotkey, e); }
    }

    var keys: Set<string> = new Set();

    let hasKey = (key: string) => keys.has(key);
    let consumeKey = (key: string) => keys.delete(key);

    let on_keyup = (e: KeyboardEvent) => {
        if(parseHotkey(e)) {
            e.preventDefault(); e.stopPropagation();
        }

        consumeKey(e.key);
    };

    let on_keydown = (e: KeyboardEvent) => {
        keys.add(e.key);
        triggerAnyHotkey(e);
    };

    let main_value: IMainContext = {
        addOnClick,
        addOnHotkey,
        removeOnClick,
        removeOnHotkey,
        clickAll,
        triggerHotkey,
        triggerAnyHotkey,
        hasKey,
        consumeKey,
    };

    let main = createRef<HTMLDivElement>();

    createEffect(() => {
        if(main.current) {
            let blur = () => main.current?.click();

            __DEV__ || w.addEventListener('blur', blur);
            w.addEventListener('keydown', on_keydown);
            w.addEventListener('keyup', on_keyup);

            onCleanup(() => {
                __DEV__ || w.removeEventListener('blur', blur);
                w.removeEventListener('keydown', on_keydown);
                w.removeEventListener('keyup', on_keyup);
            });
        }
    });

    let onContextMenu = (e: MouseEvent) => {
        if(!e.shiftKey && !hasKey('Shift')) { e.preventDefault(); }
    };

    let cancel_drop = (e: DragEvent) => {
        e.preventDefault();
    };

    return (
        <div class="ln-main" ref={main}
            oncapture:click={clickAll}
            oncapture:contextmenu={clickAll}
            on:contextmenu={onContextMenu}
            on:drop={cancel_drop}
        >
            <MainContext.Provider value={main_value}>
                <TimeProvider>
                    <Show when={!is_right_view()}>
                        <PartyList />
                    </Show>

                    <Party />

                    <MainModals />
                </TimeProvider>
            </MainContext.Provider>
        </div>
    )
}