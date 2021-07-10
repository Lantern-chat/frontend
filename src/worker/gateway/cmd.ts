export enum GatewayCommandDiscriminator {
    Connect,
    Disconnect,
    SetPresence,
}

export interface GatewayCommandConnect {
    t: GatewayCommandDiscriminator.Connect,
    auth: string,
}
export interface GatewayCommandDisconnect {
    t: GatewayCommandDiscriminator.Disconnect,
}
export interface GatewayCommandSetPresence {
    t: GatewayCommandDiscriminator.SetPresence,
    away: boolean,
}

export type GatewayCommand =
    GatewayCommandConnect |
    GatewayCommandDisconnect |
    GatewayCommandSetPresence;