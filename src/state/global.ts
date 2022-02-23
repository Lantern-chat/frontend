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

export interface IGatewayWorker extends Worker {
    postCmd: (cmd: GatewayCommand) => void,
}

export interface IHistoryExt extends BrowserHistory {
    pushMobile(to: To, state?: any): void;
}

interface IGlobalState {
    gateway?: IGatewayWorker,
    cleanup_timer: ReturnType<typeof setInterval>,
    history: IHistoryExt,
    store: Store<RootState, Action> & { dispatch: (action: DispatchableAction) => void },
    client: Client,
}

// use `window` to avoid duplicates in edge-cases
export const GLOBAL: IGlobalState = window['LANTERN_GLOABL'] = window['LANTERN_GLOBAL'] || (function(): IGlobalState {
    let history = createBrowserHistory() as IHistoryExt;

    history.pushMobile = IS_MOBILE ? history.replace : history.push;
    history.listen(update => STORE.dispatch({
        type: Type.HISTORY_UPDATE,
        update,
        ctx: recomputeHistoryContext(history)
    }));

    let session = loadSession();

    let client = new Client(new Driver(""));

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
                let show_user_list = localStorage.getItem(StorageKey.SHOW_USER_LIST);
                return typeof show_user_list == 'string' ? JSON.parse(show_user_list) : DEFAULT_WINDOW.show_user_list;
            })()
        }
    }, enhancers);

    window.addEventListener('resize', () => {
        store.dispatch({ type: Type.WINDOW_RESIZE });
    });

    window.addEventListener('beforeunload', () => {
        // quick way to prevent reconnecting before unloading is to make the gateway stop existing
        GLOBAL.gateway = undefined;
    });

    return {
        client,
        history,
        store,
        cleanup_timer: setInterval(() => {
            let state = STORE.getState(), chat = state.chat, has_typing = false;

            if(!chat) return;

            for(let room of chat.rooms.values()) {
                if(room.typing.length > 0) {
                    has_typing = true;
                    break;
                }
            }

            if(has_typing) {
                STORE.dispatch({ type: Type.CLEANUP_TYPING });
            }
        }, 2000) // every 2 seconds
    };
}());

export const HISTORY = GLOBAL.history;
export const STORE = GLOBAL.store;
export const CLIENT = GLOBAL.client;

export const DEFAULT_LOGGED_IN_CHANNEL: string = "/channels/@me";

const ACCEPTABLE_PATHS = ['login', 'register', 'channels', 'verify', 'reset', 'invite', 'settings'];
let first_part = HISTORY.location.pathname.slice(1).split('/', 1)[0];

let session = STORE.getState().user.session;
if(!ACCEPTABLE_PATHS.includes(first_part)) {
    __DEV__ && console.log("Redirecting to either main or login");

    HISTORY.replace(session != null ? DEFAULT_LOGGED_IN_CHANNEL : '/login')
} else if(['login', 'register'].includes(first_part) && session != null) {
    __DEV__ && console.log("Redirecting to main because login/register have no point here");

    HISTORY.replace(DEFAULT_LOGGED_IN_CHANNEL);
}

setTheme(themeSelector(STORE.getState()), false);