import { createStore } from "redux";
import { enhancers, initialReducer, Type } from "./initial";

import { createBrowserHistory } from "history";

import { loadSession } from "lib/session";
import { recomputeHistoryContext } from "ui/components/history";

export { DYNAMIC_MIDDLEWARE } from "./root";

interface IGlobalState {
    gateway?: Worker,
}

export const GLOBAL: IGlobalState = {};

export const HISTORY = createBrowserHistory();
export const STORE = createStore(initialReducer, {
    history: recomputeHistoryContext(HISTORY),
    user: { session: loadSession() }
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