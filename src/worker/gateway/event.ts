import { HelloEvent, Message, ReadyEvent, TypingStartEvent, UserPresenceUpdateEvent, UserUpdateEvent } from "state/models";

export enum GatewayEventCode {
    Hello = 0,
    HeartbeatACK = 1,
    Ready = 2,
    InvalidSession = 3,
    PartyCreate = 4,
    PartyUpdate = 5,
    PartyDelete = 6,
    RoleCreate = 7,
    RoleUpdate = 8,
    RoleDelete = 9,
    MemberAdd = 10,
    MemberUpdate = 11,
    MemberRemove = 12,
    RoomCreate = 13,
    RoomUpdate = 14,
    RoomDelete = 15,
    RoomPinsUpdate = 16,
    MessageCreate = 17,
    MessageUpdate = 18,
    MessageDelete = 19,
    MessageReactionAdd = 20,
    MessageReactionRemove = 21,
    MessageReactionRemoveAll = 22,
    MessageReactionRemoveEmote = 23,
    PresenceUpdate = 24,
    TypingStart = 25,
    UserUpdate = 26,
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
export type GatewayEventPresenceUpdate = GenericEvent<GatewayEventCode.PresenceUpdate, UserPresenceUpdateEvent>;
export type GatewayEventUserUpdate = GenericEvent<GatewayEventCode.UserUpdate, UserUpdateEvent>;

export type GatewayEvent =
    GatewayEventHello |
    GatewayEventHeartbeatACK |
    GatewayEventReady |
    GatewayEventMsgCreate |
    GatewayEventTypingStart |
    GatewayEventPresenceUpdate |
    GatewayEventUserUpdate;