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

//export interface GatewayEventHello {
//    o: GatewayEventCode.Hello,
//    p: {
//        heartbeat_interval: number,
//    }
//}

//export interface GatewayEventHeartbeatACK {
//    o: GatewayEventCode.HeartbeatACK;
//}

export type GatewayEventHello = GenericEvent<GatewayEventCode.Hello, { heartbeat_interval: number }>;
export type GatewayEventHeartbeatACK = GenericEvent<GatewayEventCode.HeartbeatACK>;

export interface GatewayEventReadyPayload {

}

export type GatewayEventReady = GenericEvent<GatewayEventCode.Ready, GatewayEventReadyPayload>;

export type GatewayEvent =
    GatewayEventHello |
    GatewayEventHeartbeatACK |
    GatewayEventReady;