import { Dayjs } from "dayjs";

export interface ISession {
    auth: string,
    expires: Dayjs,
    timeout?: LongTimeout,
}

import dayjs, { LongTimeout, setLongTimeout } from "lib/time";
import { LanternDispatch, Type } from "state/actions";

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

export function loadSession(): ISession | null {
    return parseSession(localStorage.getItem(SESSION_KEY));
}

export function storeSession(dispatch: LanternDispatch, session: ISession | null) {
    if(session != null) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));

        if(__DEV__) {
            console.log("Setting session expiry timer for: ", session.expires.toISOString());
        }

        session.timeout = setLongTimeout(
            () => dispatch({ type: Type.SESSION_EXPIRED }),
            Math.max(0, session.expires.diff(dayjs()))
        );
    } else {
        localStorage.removeItem(SESSION_KEY);
    }
}