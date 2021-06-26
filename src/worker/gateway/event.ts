import { HelloEvent, Message, ReadyEvent, TypingStartEvent } from "state/models";

export enum GatewayEventCode {
    Hello = 0,
    HeartbeatACK = 2,
    Ready = 3,
    InvalidSession = 4,

    ChannelCreate = 5,
    ChannelUpdate = 6,
    ChannelDelete = 7,

    MessageCreate = 8,
    MessageUpdate = 9,
    MessageDelete = 10,

    PresenceUpdate = 11,

    TypingStart = 12,
}

export interface GenericEvent<O, P = undefined> {
    o: O,
    p: P,
}

export type GatewayEventHello = GenericEvent<GatewayEventCode.Hello, HelloEvent>;
export type GatewayEventHeartbeatACK = GenericEvent<GatewayEventCode.HeartbeatACK>;
export type GatewayEventReady = GenericEvent<GatewayEventCode.Ready, ReadyEvent>;
export type GatewayEventMsgCreate = GenericEvent<GatewayEventCode.MessageCreate, Message>;
export type GatewayEventTypingStart = GenericEvent<GatewayEventCode.TypingStart, TypingStartEvent>;

export type GatewayEvent =
    GatewayEventHello |
    GatewayEventHeartbeatACK |
    GatewayEventReady |
    GatewayEventMsgCreate |
    GatewayEventTypingStart;