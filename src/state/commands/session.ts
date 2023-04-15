import { ISession, parseSession } from "lib/session";
import { CLIENT, DEFAULT_LOGGED_IN_ROOM, HISTORY } from "state/global";
import { DispatchableAction, Type } from "state/actions";
import { setLongTimeout } from "lib/time";
import { storeSession } from "state/storage";

import { Session } from "client-sdk/src/models";
import { BearerToken } from "client-sdk/src/models/auth";

export function setSession(new_session: ISession | Session | null): DispatchableAction {
    return (dispatch) => {
        let session = parseSession(new_session);

        // stores or removes session based on if session is null
        storeSession(session);

        if(session != null) {
            __DEV__ && console.log("Setting session expiry timer for: ", new Date(session.expires).toISOString());

            // TODO: Double-check this gets cleared eventually
            session.timeout = setLongTimeout(
                () => dispatch({ type: Type.SESSION_EXPIRED }),
                Math.max(0, session.expires - Date.now()),
            );

            CLIENT.set_auth(new BearerToken(session.auth));
            dispatch({ type: Type.SESSION_LOGIN, session });
            HISTORY.pm(DEFAULT_LOGGED_IN_ROOM);
        } else {
            dispatch({ type: Type.SESSION_EXPIRED });

            CLIENT.set_auth(null);
            HISTORY.pm("/login");
        }
    }
};

import { UserLogout } from "client-sdk/src/api/commands/user";

export function logout(): DispatchableAction {
    return async (dispatch, state) => {
        if(state.user.session) {
            await CLIENT.execute(UserLogout({}));
            dispatch(setSession(null));
        }
    }
}