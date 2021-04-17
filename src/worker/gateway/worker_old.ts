export enum GatewayCommandOp {
    Connect,
    SendMessage,
}

export interface IConnect {
    name: string,
    host: string,
    compress: boolean,
}

export interface ISendMessage {
    to: string,
    msg: string,
}

export interface GatewayOpMap {
    [GatewayCommandOp.Connect]: IConnect,
    [GatewayCommandOp.SendMessage]: ISendMessage,
}

export interface GatewayCommand<K extends keyof GatewayOpMap> {
    op: K,
    data: GatewayOpMap[K],
}