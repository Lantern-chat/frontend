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

export type GatewayMessage = GatewayMessageInitiatized | GatewayMessageConnecting | GatewayMessageConnected;
