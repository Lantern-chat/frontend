import { ISession, parseSession, storeSession } from "lib/session";
import { DEFAULT_LOGGED_IN_CHANNEL, HISTORY } from "state/global";
import { DispatchableAction, Type } from "state/actions";

export function setSession(session: ISession | null): DispatchableAction {
    return (dispatch) => {
        session = parseSession(session);

        // stores or removes session based on if session is null
        storeSession(dispatch, session);

        if(session != null) {
            dispatch({ type: Type.SESSION_LOGIN, session });

            HISTORY.push(DEFAULT_LOGGED_IN_CHANNEL);
        } else {
            dispatch({ type: Type.SESSION_EXPIRED });

            HISTORY.push('/login');
        }
    }
};
