import React from "preact/compat";
import { ChannelModel } from "./channel";
import { TinyEventEmitter } from "./_event";


export class PartyModel extends TinyEventEmitter {
    data: IParty;
    channels: ChannelModel[];

    getChannels(): ChannelModel[] {
        return this.channels;
    }
}

export interface IHost {
    username: string,
    url: string,
    auth: string,
}

export interface IParty {
    host: IHost,
}

export const PartyContext = React.createContext<IParty>(null!);