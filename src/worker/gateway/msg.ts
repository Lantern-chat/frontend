import { ReadyEvent } from "state/main/models";

export enum GatewayMessageDiscriminator {
    Initialized,
    Connecting,
    Connected,
    Identifying,
    Ready,
    Disconnected,
    Message,
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

export type GatewayMessage =
    GatewayMessageInitiatized |
    GatewayMessageConnecting |
    GatewayMessageConnected |
    GatewayMessageIdentifying |
    GatewayMessageReady |
    GatewayMessageDisconnected;
