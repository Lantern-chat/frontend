import { ReadyEvent } from "state/models";
import { GatewayEvent } from "./event";

export enum GatewayMessageDiscriminator {
    Initialized,
    Connecting,
    Waiting,
    Connected,
    Identifying,
    Ready,
    Disconnected,
    Event,
    Error,
}

export interface GatewayMessageInitiatized {
    t: GatewayMessageDiscriminator.Initialized;
}
export interface GatewayMessageConnecting {
    t: GatewayMessageDiscriminator.Connecting;
}
export interface GatewayMessageWaiting {
    t: GatewayMessageDiscriminator.Waiting;
    p: number; // timestamp in unix time milliseconds
}
export interface GatewayMessageConnected {
    t: GatewayMessageDiscriminator.Connected;
}
export interface GatewayMessageIdentifying {
    t: GatewayMessageDiscriminator.Identifying;
}
export interface GatewayMessageReady {
    t: GatewayMessageDiscriminator.Ready;
    p: ReadyEvent,
}
export interface GatewayMessageDisconnected {
    t: GatewayMessageDiscriminator.Disconnected;
    p: number,
}

export interface GatewayMessageEvent {
    t: GatewayMessageDiscriminator.Event;
    p: GatewayEvent
}

export interface GatewayMessageError {
    t: GatewayMessageDiscriminator.Error;
    p: any;
}

export type GatewayMessage =
    GatewayMessageInitiatized |
    GatewayMessageConnecting |
    GatewayMessageWaiting |
    GatewayMessageConnected |
    GatewayMessageIdentifying |
    GatewayMessageReady |
    GatewayMessageDisconnected |
    GatewayMessageEvent |
    GatewayMessageError;
