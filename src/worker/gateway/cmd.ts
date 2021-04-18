
export enum GatewayCommandDiscriminator {
    Connect,
    Disconnect,
    Identify,
}

export interface GatewayCommandConnect {
    t: GatewayCommandDiscriminator.Connect;
}
export interface GatewayCommandDisconnect {
    t: GatewayCommandDiscriminator.Disconnect;
}
export interface GatewayCommandIdentify {
    t: GatewayCommandDiscriminator.Identify;
    auth: string;
}

export type GatewayCommand = GatewayCommandConnect | GatewayCommandDisconnect | GatewayCommandIdentify;