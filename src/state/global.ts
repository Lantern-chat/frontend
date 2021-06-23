import { createStore } from "redux";
import { enhancers, initialReducer, Type } from "./initial";

import { createBrowserHistory } from "history";

import { loadSession } from "lib/session";

export const HISTORY = createBrowserHistory();
export const STORE = createStore(initialReducer, {
    history: { history: HISTORY, location: HISTORY.location },
    user: { session: loadSession() }
}, enhancers);

HISTORY.listen(update => STORE.dispatch({ type: Type.HISTORY_UPDATE, update }));


export const DEFAULT_LOGGED_IN_CHANNEL: string = "/channels/@me";





const ACCEPTABLE_PATHS = ['login', 'register', 'channels'];
let first_part = HISTORY.location.pathname.slice(1).split('/', 1)[0];

let session = STORE.getState().user.session;
if(ACCEPTABLE_PATHS.indexOf(first_part) == -1) {
    HISTORY.replace(session != null ? DEFAULT_LOGGED_IN_CHANNEL : '/login')
} else if(['login', 'register'].indexOf(first_part) >= 0 && session != null) {
    HISTORY.replace(DEFAULT_LOGGED_IN_CHANNEL);
}