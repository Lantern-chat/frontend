import { GatewayMessageDiscriminator } from "worker/gateway/msg";
import { Action, Type } from "../actions";

import { Snowflake, Party } from "../models";

export interface IPartyState {
    parties: Map<Snowflake, Party>,
    last_channel: Map<Snowflake, Snowflake>,
    //sorted: Snowflake[]
}

const DEFAULT_STATE: IPartyState = {
    parties: new Map(),
    last_channel: new Map(),
    //sorted: [],
};

export function partyReducer(state: IPartyState | null | undefined, action: Action) {
    state = state || DEFAULT_STATE;

    switch(action.type) {
        case Type.SESSION_EXPIRED: return DEFAULT_STATE;
        case Type.GATEWAY_EVENT: {
            switch(action.payload.t) {
                case GatewayMessageDiscriminator.Ready: {
                    let p = action.payload.p;

                    let parties = new Map();
                    for(let party of p.parties) {
                        parties.set(party.id, party);
                    }
                    return { ...state, parties };
                }
            }
        }
    }

    return state;
}