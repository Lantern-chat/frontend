import { createStore } from "redux";
import { enhancers, initialReducer, Type } from "./initial";

import { createBrowserHistory } from "history";

import { setTheme } from "lib/theme";
import { recomputeHistoryContext } from "ui/components/history";
import { DEFAULT_STATE as DEFAULT_WINDOW } from "./reducers/window";
import { DEFAULT_STATE as DEFAULT_USER } from './reducers/user';
import { StorageKey, loadTheme, loadSession } from "./storage";
import { GatewayCommand } from "worker/gateway/cmd";

export { DYNAMIC_MIDDLEWARE } from "./root";

export interface IGatewayWorker extends Worker {
    postCmd: (cmd: GatewayCommand) => void,
}

interface IGlobalState {
    gateway?: IGatewayWorker,
    cleanup_timer?: ReturnType<typeof setInterval>,
}

export const GLOBAL: IGlobalState = {};

export const HISTORY = createBrowserHistory();

export const STORE = createStore(initialReducer, {
    history: recomputeHistoryContext(HISTORY),
    user: { ...DEFAULT_USER, session: loadSession() },
    theme: loadTheme(),
    window: {
        ...DEFAULT_WINDOW,
        show_user_list: (() => {
            let show_user_list = localStorage.getItem(StorageKey.SHOW_USER_LIST);
            return typeof show_user_list == 'string' ? JSON.parse(show_user_list) : DEFAULT_WINDOW.show_user_list;
        })()
    }
}, enhancers);

HISTORY.listen(update => STORE.dispatch({
    type: Type.HISTORY_UPDATE,
    update,
    ctx: recomputeHistoryContext(HISTORY)
}));

window.addEventListener('resize', () => {
    STORE.dispatch({ type: Type.WINDOW_RESIZE });
});

window.addEventListener('beforeunload', () => {
    // quick way to prevent reconnecting before unloading is to make the gateway stop existing
    GLOBAL.gateway = undefined;
});


GLOBAL.cleanup_timer = setInterval(() => {
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
}, 2000); // every 2 seconds


export const DEFAULT_LOGGED_IN_CHANNEL: string = "/channels/@me";

const ACCEPTABLE_PATHS = ['login', 'register', 'channels', 'verify', 'reset', 'invite'];
let first_part = HISTORY.location.pathname.slice(1).split('/', 1)[0];

let session = STORE.getState().user.session;
if(ACCEPTABLE_PATHS.indexOf(first_part) == -1) {
    __DEV__ && console.log("Redirecting to either main or login");

    HISTORY.replace(session != null ? DEFAULT_LOGGED_IN_CHANNEL : '/login')
} else if(['login', 'register'].indexOf(first_part) >= 0 && session != null) {
    __DEV__ && console.log("Redirecting to main because login/register have no point here");

    HISTORY.replace(DEFAULT_LOGGED_IN_CHANNEL);
}

setTheme(STORE.getState().theme, false);