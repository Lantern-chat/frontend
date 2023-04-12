import { onCleanup, onMount, Show } from "solid-js";
import throttle from "lodash/throttle";

import { Action, useRootStore } from "state/root";
import { mainMutator, Type } from "state/main";
import { GLOBAL, STORE, HISTORY, type IGatewayWorker } from "state/global";
import { mainEffect } from "state/effects/main";
import type { IHistoryState } from "state/mutators";
import type { ISession } from "lib/session";
import { MainEventEmitter } from "./state";

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
        HISTORY.replace("/login");
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

import { Hotkey, IMainContext, MainContext, NavEvent, OnClickHandler, OnKeyHandler, OnNavHandler, parseHotkey, useMainHotkey } from "ui/hooks/useMain";
import { TimeProvider } from "ui/hooks/createTimestamp";

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
    let { dispatch, state } = useRootStore();

    /// AWAY/ONLINE PRESENCE SETUP

    let w = window, away_timer: number, set_away = () => dispatch(setPresence(true));
    let activity_events = ["mousemove", "keydown", "touchstart"];

    let away_listener = throttle(() => {
        dispatch(setPresence(false));
        clearTimeout(away_timer)
        away_timer = setTimeout(set_away, 1000 * 60 * 10); // 10 minutes
    }, 1000);

    activity_events.forEach(e => w.addEventListener(e, away_listener));
    onCleanup(() => { activity_events.forEach(e => w.removeEventListener(e, away_listener)); clearTimeout(away_timer) });

    /// MAIN CONTEXT SETUP

    let events = new MainEventEmitter();

    let tryNav = (url: string | undefined): boolean | Promise<boolean> => {
        if(!events.has('nav')) {
            return true;
        }

        return new Promise((resolve) => {
            // an array of the first arguments given to nav_event's wait_until callback
            let waiters: Array<Parameters<NavEvent[1]>[0]> = [];
            let args: NavEvent = [url, (p) => waiters.push(p)];

            events.emit("nav", args, () => {
                Promise.all(waiters).then((tries) => {
                    resolve(tries.reduce((a, b) => a && b, true));
                });
            });
        });
    };

    let clickAll = (e: MouseEvent) => {
        //__DEV__ && console.log(click_listeners);
        events.emit('click', e);
    };

    let triggerHotkey = (hotkey: Hotkey, e: KeyboardEvent) => {
        e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();

        events.emit(hotkey, e);
    };

    let triggerAnyHotkey = (e: KeyboardEvent) => {
        let hotkey = parseHotkey(e);
        if(hotkey) { triggerHotkey(hotkey, e) }
    }

    var keys: Set<string> = new Set();

    let hasKey = (key: string) => keys.has(key);
    let consumeKey = (key: string) => keys.delete(key);

    let on_keyup = (e: KeyboardEvent) => {
        if(parseHotkey(e)) {
            e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
        }

        consumeKey(e.key);
    };

    let on_keydown = (e: KeyboardEvent) => {
        keys.add(e.key);
        triggerAnyHotkey(e);
    };

    let main: HTMLDivElement | undefined;

    let main_value: IMainContext = {
        main: () => main!,
        events,
        triggerHotkey,
        triggerAnyHotkey,
        hasKey,
        consumeKey,
        tryNav,
    };

    onMount(() => {
        let blur = () => main!.click();

        __DEV__ || w.addEventListener("blur", blur);
        w.addEventListener("keydown", on_keydown);
        w.addEventListener("keyup", on_keyup);

        onCleanup(() => {
            __DEV__ || w.removeEventListener("blur", blur);
            w.removeEventListener("keydown", on_keydown);
            w.removeEventListener("keyup", on_keyup);
        });
    });

    let onContextMenu = (e: MouseEvent) => {
        if(!e.shiftKey && !hasKey("Shift")) { e.preventDefault(); }
    };

    let is_right_view = () => state.window.use_mobile_view && state.window.show_panel == Panel.RightUserList;

    let cancel_drop = (e: DragEvent) => {
        e.preventDefault();
    };

    return (
        <div class="ln-main" ref={main}
            oncapture:click={clickAll}
            oncapture:contextmenu={clickAll}
            onContextMenu={onContextMenu}
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