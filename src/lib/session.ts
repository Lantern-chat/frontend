import { Session } from "client-sdk/src/models";
import { Dayjs } from "dayjs";
import dayjs, { LongTimeout } from "lib/time";

export interface ISession {
    auth: string,
    expires: number,
    timeout?: LongTimeout,
}

export function parseSession(session: string | Session | ISession | null): ISession | null {
    if(typeof session === 'string') {
        session = JSON.parse(session) as ISession;
    }

    if(session !== null) {
        if(typeof session.expires === 'string') {
            session.expires = Date.parse(session.expires);
        }

        if(Date.now() > session.expires) {
            return null;
        }
    }

    return session as any;
}