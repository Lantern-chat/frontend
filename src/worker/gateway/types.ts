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

export enum GatewayCommandType {
    Connect,
    Identify,
}

export interface GatewayCommand {
    t: GatewayCommandType,
    p: any,
}