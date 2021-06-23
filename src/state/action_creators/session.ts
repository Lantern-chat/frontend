import { ISession, parseSession, storeSession } from "lib/session";
import { DEFAULT_LOGGED_IN_CHANNEL, HISTORY } from "state/global";
import { DispatchableAction, Type } from "../actions";

export function setSession(session: ISession | null): DispatchableAction {
    return (dispatch) => {
        session = parseSession(session);

        if(session != null) {
            storeSession(dispatch, session);

            dispatch({ type: Type.SESSION_LOGIN, session });

            HISTORY.push(DEFAULT_LOGGED_IN_CHANNEL);
        } else {
            // TODO: This is usually set on login/register, so this
            // should be impossible, right?
            dispatch({ type: Type.SESSION_EXPIRED });
        }
    }
};
