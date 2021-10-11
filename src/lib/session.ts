import { Dayjs } from "dayjs";
import dayjs, { LongTimeout, parse_shorthand } from "lib/time";

export interface ISession {
    auth: string,
    expires: Dayjs,
    timeout?: LongTimeout,
}

export function parseSession(session: string | ISession | null): ISession | null {
    if(typeof session === 'string') {
        session = JSON.parse(session) as ISession;
    }

    if(session !== null) {
        session.expires = parse_shorthand(session.expires);

        if(dayjs().isAfter(session.expires)) {
            return null;
        }
    }

    return session;
}