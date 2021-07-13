import { Activity } from "state/models";

export enum GatewayClientCommandDiscriminator {
    Heartbeat = 0,
    Identify = 1,
    Resume = 2,
    SetPresence = 3,
}

export interface GatewayClientHeartbeat {
    o: GatewayClientCommandDiscriminator.Heartbeat;
}
export interface GatewayClientIdentify {
    o: GatewayClientCommandDiscriminator.Identify;
    p: {
        auth: string,
        intent: number,
    }
}
export interface GatewayClientResume {
    o: GatewayClientCommandDiscriminator.Resume;
    p: {
        session: string,
    }
}
export interface GatewayClientSetPresence {
    o: GatewayClientCommandDiscriminator.SetPresence,
    p: {
        flags: number,
        activity?: Activity,
    }
}

export type GatewayClientCommand =
    GatewayClientHeartbeat |
    GatewayClientIdentify |
    GatewayClientResume |
    GatewayClientSetPresence;