import { ISession, parseSession } from "lib/session";
import { CLIENT, DEFAULT_LOGGED_IN_CHANNEL, HISTORY } from "state/global";
import { DispatchableAction, Type } from "state/actions";
import dayjs, { setLongTimeout } from "lib/time";
import { storeSession } from "state/storage";
import { fetch, XHRMethod } from "lib/fetch";

import { BearerToken } from "client-sdk/src/models/auth";

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

            CLIENT.set_auth(new BearerToken(session.auth));
            dispatch({ type: Type.SESSION_LOGIN, session });
            HISTORY.pushMobile(DEFAULT_LOGGED_IN_CHANNEL);
        } else {
            dispatch({ type: Type.SESSION_EXPIRED });

            CLIENT.set_auth(null);
            HISTORY.pushMobile('/login');
        }
    }
};

import { UserLogout } from "client-sdk/src/api/commands/user";

export function logout(): DispatchableAction {
    return async (dispatch, getState) => {
        if(getState().user.session) {
            await CLIENT.execute(UserLogout({}));
            dispatch(setSession(null));
        }
    }
}