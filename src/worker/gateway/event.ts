import { HelloEvent, MemberEvent, Message, MessageDeleteEvent, ReadyEvent, TypingStartEvent, UserPresenceUpdateEvent, UserUpdateEvent } from "state/models";

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
    MemberBan = 13,
    MemberUnban = 14,
    RoomCreate = 15,
    RoomUpdate = 16,
    RoomDelete = 17,
    RoomPinsUpdate = 18,
    MessageCreate = 19,
    MessageUpdate = 20,
    MessageDelete = 21,
    MessageReactionAdd = 22,
    MessageReactionRemove = 23,
    MessageReactionRemoveAll = 24,
    MessageReactionRemoveEmote = 25,
    PresenceUpdate = 26,
    TypingStart = 27,
    UserUpdate = 28,
}

export interface GenericEvent<O, P = undefined> {
    o: O,
    p: P,
}

export type GatewayEventHello = GenericEvent<GatewayEventCode.Hello, HelloEvent>;
export type GatewayEventHeartbeatACK = GenericEvent<GatewayEventCode.HeartbeatACK>;
export type GatewayEventReady = GenericEvent<GatewayEventCode.Ready, ReadyEvent>;
export type GatewayEventMsgCreate = GenericEvent<GatewayEventCode.MessageCreate, Message>;
export type GatewayEventMsgDelete = GenericEvent<GatewayEventCode.MessageDelete, MessageDeleteEvent>;
export type GatewayEventTypingStart = GenericEvent<GatewayEventCode.TypingStart, TypingStartEvent>;
export type GatewayEventPresenceUpdate = GenericEvent<GatewayEventCode.PresenceUpdate, UserPresenceUpdateEvent>;
export type GatewayEventUserUpdate = GenericEvent<GatewayEventCode.UserUpdate, UserUpdateEvent>;
export type GatewayEventInvalidSession = GenericEvent<GatewayEventCode.InvalidSession>;

export type GatewayEventMemberAdd = GenericEvent<GatewayEventCode.MemberAdd, MemberEvent>;
export type GatewayEventMemberRemove = GenericEvent<GatewayEventCode.MemberRemove, MemberEvent>;
export type GatewayEventMemberUpdate = GenericEvent<GatewayEventCode.MemberUpdate, MemberEvent>;
export type GatewayEventMemberBan = GenericEvent<GatewayEventCode.MemberBan, MemberEvent>;
export type GatewayEventMemberUnban = GenericEvent<GatewayEventCode.MemberUnban, MemberEvent>;


export type GatewayEvent =
    GatewayEventInvalidSession |
    GatewayEventHello |
    GatewayEventHeartbeatACK |
    GatewayEventReady |
    GatewayEventMsgCreate |
    GatewayEventMsgDelete |
    GatewayEventTypingStart |
    GatewayEventPresenceUpdate |
    GatewayEventUserUpdate |
    GatewayEventMemberAdd |
    GatewayEventMemberRemove |
    GatewayEventMemberUpdate |
    GatewayEventMemberBan |
    GatewayEventMemberUnban

    ;