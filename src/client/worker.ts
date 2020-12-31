export enum MessageOp {
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

export interface MessageOpMap {
    [MessageOp.Connect]: IConnect,
    [MessageOp.SendMessage]: ISendMessage,
}

export interface Message<K extends keyof MessageOpMap> {
    op: K,
    data: MessageOpMap[K],
}