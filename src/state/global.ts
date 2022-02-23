import { createStore, Store } from "redux";
import { enhancers, initialReducer, Type } from "./initial";

import { BrowserHistory, createBrowserHistory, To } from "history";

import { Client } from "client-sdk/src/client";
import { Driver } from "client-sdk/src/driver";

import { setTheme } from "lib/theme";
import { recomputeHistoryContext } from "ui/components/history";
import { DEFAULT_STATE as DEFAULT_WINDOW } from "./reducers/window";
import { DEFAULT_STATE as DEFAULT_USER } from './reducers/user';
import { StorageKey, loadSession, loadPrefs } from "./storage";
import { GatewayCommand } from "worker/gateway/cmd";
import { themeSelector } from "./selectors/theme";
import { IS_MOBILE } from "lib/user_agent";
import { RootState, Action, DispatchableAction } from "./root";
import { BearerToken } from "client-sdk/src/models/auth";

export { DYNAMIC_MIDDLEWARE } from "./root";

export const DEFAULT_LOGGED_IN_CHANNEL: string = "/channels/@me";

export interface IGatewayWorker extends Worker {
    postCmd: (cmd: GatewayCommand) => void,
}

export interface IHistoryExt extends BrowserHistory {
    /**
     * pm: Short for "push mobile"
     *
     * Same as History.push, but replaced by History.replace on mobile to improve experience,
     * because touch-swiping tends to accidentally navigate backwards and cause issues.
     *
     * @param to Path
     * @param state any
     */
    pm(to: To, state?: any): void;
}

interface IGlobalState {
    gateway?: IGatewayWorker,
    cleanup_timer: ReturnType<typeof setInterval>,
    history: IHistoryExt,
    store: Store<RootState, Action> & { dispatch: (action: DispatchableAction) => void },
    client: Client,
    patched_main: boolean,
}

// use `window` to avoid duplicates in edge-cases
// all this code should only run once
export const GLOBAL: IGlobalState = window['LANTERN_GLOABL'] = window['LANTERN_GLOBAL'] || (function(): IGlobalState {
    let history = createBrowserHistory() as IHistoryExt;
    history.pm = IS_MOBILE ? history.replace : history.push;

    let session = loadSession(),
        client = new Client(new Driver("")); // initialize for the current domain

    if(session) {
        client.set_auth(new BearerToken(session.auth));
    }

    let store = createStore(initialReducer, {
        history: recomputeHistoryContext(history),
        user: { ...DEFAULT_USER, session },
        prefs: loadPrefs(),
        window: {
            ...DEFAULT_WINDOW,
            show_user_list: (() => {
                // TODO: Centralize storage of this
                let show_user_list = localStorage.getItem(StorageKey.SHOW_USER_LIST);
                return typeof show_user_list == 'string' ? JSON.parse(show_user_list) : DEFAULT_WINDOW.show_user_list;
            })()
        }
    }, enhancers);

    history.listen(update => store.dispatch({
        type: Type.HISTORY_UPDATE,
        update,
        ctx: recomputeHistoryContext(history)
    }));

    window.addEventListener('resize', () => {
        store.dispatch({ type: Type.WINDOW_RESIZE });
    });

    window.addEventListener('beforeunload', () => {
        // quick way to prevent reconnecting before unloading is to make the gateway stop existing
        GLOBAL.gateway = undefined;
    });

    const ACCEPTABLE_PATHS = ['login', 'register', 'channels', 'verify', 'reset', 'invite', 'settings'];
    let first_part = history.location.pathname.slice(1).split('/', 1)[0];

    if(!ACCEPTABLE_PATHS.includes(first_part)) {
        __DEV__ && console.log("Redirecting to either main or login");

        history.replace(session != null ? DEFAULT_LOGGED_IN_CHANNEL : '/login');

    } else if(['login', 'register'].includes(first_part) && session != null) {
        __DEV__ && console.log("Redirecting to main because login/register have no point here");

        history.replace(DEFAULT_LOGGED_IN_CHANNEL);
    }

    setTheme(themeSelector(store.getState()), false);

    return {
        // will be set to true when main view loads
        patched_main: false,
        client,
        history,
        store,
        cleanup_timer: setInterval(() => {
            let state = store.getState(), chat = state.chat, has_typing = false;

            if(!chat) return;

            for(let room of chat.rooms.values()) {
                if(room.typing.length > 0) {
                    has_typing = true;
                    break;
                }
            }

            if(has_typing) {
                store.dispatch({ type: Type.CLEANUP_TYPING });
            }
        }, 2000) // every 2 seconds
    };
}());

// aliases
export const HISTORY = GLOBAL.history;
export const STORE = GLOBAL.store;
export const CLIENT = GLOBAL.client;