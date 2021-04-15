export enum GatewayMessageType {
    Init,
    Connecting,
    Connected,
    Identifying,
    Ready,
    Disconnected,
    Message,
    Error,
}

export interface GatewayWorkerMessage {
    t: GatewayMessageType,
    p?: any,
}