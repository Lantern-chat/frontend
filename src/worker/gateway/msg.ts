import { ReadyEvent } from "state/models";
import { GatewayEvent } from "./event";

export enum GatewayMessageDiscriminator {
    Initialized,
    Connecting,
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
}

export interface GatewayMessageEvent {
    t: GatewayMessageDiscriminator.Event;
    p: GatewayEvent
}

export type GatewayMessage =
    GatewayMessageInitiatized |
    GatewayMessageConnecting |
    GatewayMessageConnected |
    GatewayMessageIdentifying |
    GatewayMessageReady |
    GatewayMessageDisconnected |
    GatewayMessageEvent;
