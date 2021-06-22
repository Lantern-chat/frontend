import { ISession, parseSession, storeSession } from "lib/session";
import { DispatchableAction, Type } from "../actions";

export function sessionSet(session: ISession | null): DispatchableAction {
    return (dispatch, getState) => {
        session = parseSession(session);
        if(session != null) {
            dispatch({ type: Type.SESSION_LOGIN, session });
            storeSession(dispatch, session);

            getState().history.history.push('/channels/@me');

        } else {
            // TODO: This is usually set on login/register, so this
            // should be impossible, right?
            dispatch({ type: Type.SESSION_EXPIRED });
        }
    }
};
