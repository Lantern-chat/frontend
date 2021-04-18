export enum GatewayClientCommandDiscriminator {
    Heartbeat = 0,
    Identify = 1,
    Resume = 2,
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

export type GatewayClientCommand =
    GatewayClientHeartbeat |
    GatewayClientIdentify |
    GatewayClientResume;