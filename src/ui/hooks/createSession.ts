import { useEffect, useState } from "react";

import { ISession, ISessionContext } from "lib/session";
import dayjs, { setLongTimeout } from "lib/time";
// import { fetch, XHRMethod } from "lib/fetch";

const SESSION_KEY: string = 'session';

function parseSession(session: string | ISession | null): ISession | null {
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

let initialSession = parseSession(localStorage.getItem(SESSION_KEY));

export function createSession(): ISessionContext {
    let [ctx, setSession] = useState<ISessionContext>({
        session: initialSession,
        setSession: () => { },
    });

    ctx.setSession = (new_session: ISession | null) => {
        setSession({ ...ctx, session: parseSession(new_session) });
    };

    // // on startup, check if valid session
    // useEffect(() => {
    //     let session = ctx.session, cancelled = false;
    //     if(session != null) {
    //         fetch({
    //             method: XHRMethod.HEAD,
    //             url: "/api/v1/user/check", headers: {
    //                 'Authorization': 'Bearer ' + session.auth,
    //             }
    //         }).catch(() => cancelled ? null : ctx.setSession(null));
    //     }
    //     return () => { cancelled = true; };
    // }, []);


    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // NOTE: useEffect can be used as a destructor by just returning a onUnmount callback

    useEffect(() => {
        let session = ctx.session, timeout: { t: number } | null = null;

        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        if(session != null) {
            if(process.env.NODE_ENV !== 'production') {
                console.log("Setting session expiry timer for: ", session.expires.toISOString());
            }

            timeout = setLongTimeout(() => ctx.setSession(null),
                Math.max(0, session.expires.diff(dayjs())));
        }
        return () => {
            if(timeout !== null) clearTimeout(timeout.t);
        };
    }, [ctx.session]);

    return ctx;
}