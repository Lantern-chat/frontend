import { createContext } from "react";

import { Dayjs } from "dayjs";

export interface ISession {
    auth: string,
    expires: Dayjs,
}

export interface ISessionContext {
    session: ISession | null,
    setSession: (session: ISession | null) => void,
}

export const Session = createContext<ISessionContext>({ session: null, setSession: () => { } });
if(process.env.NODE_ENV !== 'production') {
    Session.displayName = "Session";
}