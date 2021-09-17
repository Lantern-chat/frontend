import { ISession, parseSession } from "lib/session";
import { DEFAULT_LOGGED_IN_CHANNEL, HISTORY } from "state/global";
import { DispatchableAction, Type } from "state/actions";
import dayjs, { setLongTimeout } from "lib/time";
import { storeSession } from "state/storage";
import { fetch, XHRMethod } from "lib/fetch";

export function setSession(session: ISession | null): DispatchableAction {
    return (dispatch) => {
        session = parseSession(session);

        // stores or removes session based on if session is null
        storeSession(session);

        if(session != null) {
            __DEV__ && console.log("Setting session expiry timer for: ", session.expires.toISOString());

            // TODO: Double-check this gets cleared eventually
            session.timeout = setLongTimeout(
                () => dispatch({ type: Type.SESSION_EXPIRED }),
                Math.max(0, session.expires.diff(dayjs()))
            );

            dispatch({ type: Type.SESSION_LOGIN, session });

            HISTORY.push(DEFAULT_LOGGED_IN_CHANNEL);
        } else {
            dispatch({ type: Type.SESSION_EXPIRED });

            HISTORY.push('/login');
        }
    }
};

export function logout(): DispatchableAction {
    return async (dispatch, getState) => {
        let state = getState(),
            session = state.user.session;

        if(session) {
            await fetch({
                url: "/api/v1/user/@me",
                method: XHRMethod.DELETE,
                bearer: session.auth,
            });

            dispatch(setSession(null));
        }
    }
}