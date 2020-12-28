import React from "react";

export enum ChannelKind {
    Direct,
    Private,
    Public,
}

export interface Channel {
    id: string,
    name: string,
    kind: ChannelKind,
}

export const ChannelContext = React.createContext<Channel>(null!);