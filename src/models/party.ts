import React from "react";
import { Channel } from "./channel";

export interface Host {
    username: string,
    url: string,
    auth: string,
}

export interface Party {
    host: Host,
    channels: Channel[],
}

export const PartyContext = React.createContext<Party>(null!);