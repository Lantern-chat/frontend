export const enum GatewayCommandDiscriminator {
    Connect,
    Disconnect,
    SetPresence,
}

export interface GatewayCommandConnect {
    t: GatewayCommandDiscriminator.Connect,
    auth: string,
    intent: number,
}
export interface GatewayCommandDisconnect {
    t: GatewayCommandDiscriminator.Disconnect,
}
export interface GatewayCommandSetPresence {
    t: GatewayCommandDiscriminator.SetPresence,
    away: boolean,
    mobile: boolean,
}

export type GatewayCommand =
    | GatewayCommandConnect
    | GatewayCommandDisconnect
    | GatewayCommandSetPresence;