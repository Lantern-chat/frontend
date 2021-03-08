export enum GatewayMessageType {
    Connecting,
    Connected,
    Disconnected,
    Message,
    Error,
}

export interface GatewayWorkerMessage {
    t: GatewayMessageType,
    p?: any,
}