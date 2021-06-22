import { Dayjs } from "dayjs";

export interface ISession {
    auth: string,
    expires: Dayjs,
    timeout?: LongTimeout,
}

import dayjs, { LongTimeout, setLongTimeout } from "lib/time";
import { Store } from "redux";
import { Action, Type } from "state/actions";
import { RootState } from "state/root";

const SESSION_KEY: string = 'session';

export function parseSession(session: string | ISession | null): ISession | null {
    if(typeof session === 'string') {
        session = JSON.parse(session) as ISession;
    }

    if(session !== null) {
        session.expires = dayjs(session.expires);

        if(dayjs().isAfter(session.expires)) {
            return null;
        }
    }

    return session;
}

export var initialSession = parseSession(localStorage.getItem(SESSION_KEY));

export function storeSession(store: Store<RootState, Action>, session: ISession) {
    if(session != null) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));

        if(process.env.NODE_ENV !== 'production') {
            console.log("Setting session expiry timer for: ", session.expires.toISOString());
        }

        session.timeout = setLongTimeout(
            () => store.dispatch({ type: Type.SESSION_EXPIRED }),
            Math.max(0, session.expires.diff(dayjs()))
        );
    } else {
        localStorage.removeItem(SESSION_KEY);
    }
}