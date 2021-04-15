export interface IGatewayState {
    initialized: boolean,
    connected: boolean,
}

const DEFAULT_STATE: IGatewayState = {
    initialized: false,
    connected: false,
};

export interface GatewayAction {
    type: string,
    payload: string,
}

export function gatewayReducer(state: IGatewayState = DEFAULT_STATE, action: GatewayAction): IGatewayState {
    return state;
}