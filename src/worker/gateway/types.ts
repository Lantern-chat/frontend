export enum GatewayMessageType {
    Initialized,
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
    Disconnect,
    Identify,
}

export interface GatewayCommand {
    t: GatewayCommandType,
    p: any,
}