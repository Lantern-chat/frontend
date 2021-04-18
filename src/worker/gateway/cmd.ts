export enum GatewayCommandDiscriminator {
    Connect,
    Disconnect,
}

export interface GatewayCommandConnect {
    t: GatewayCommandDiscriminator.Connect;
    auth: string;
}
export interface GatewayCommandDisconnect {
    t: GatewayCommandDiscriminator.Disconnect;
}

export type GatewayCommand =
    GatewayCommandConnect |
    GatewayCommandDisconnect;