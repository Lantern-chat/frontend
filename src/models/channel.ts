import React from "react";

import { TinyEventEmitter } from "./_event";

export enum ChannelKind {
    Direct,
    Private,
    Public,
}

export class ChannelModel extends TinyEventEmitter {
    public data: IChannel;
}

export interface IChannel {
    id: string,
    name: string,
    kind: ChannelKind,
    users: any[],
}

export const ChannelContext = React.createContext<IChannel>(null!);