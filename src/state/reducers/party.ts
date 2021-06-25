import produce from "immer";
import { GatewayMessageDiscriminator } from "worker/gateway/msg";
import { Action, Type } from "../actions";

import { Snowflake, Party, Room } from "../models";

export interface IParty {
    party: Party,
    rooms: Room[],
}

export interface IPartyState {
    parties: Map<Snowflake, IParty>,
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
        case Type.ROOMS_LOADED: return produce(state, draft => {
            action.rooms.sort((a, b) => a.sort_order - b.sort_order);

            for(let room of action.rooms) {
                if(room.party_id) {
                    draft.parties.get(room.party_id)?.rooms.push(room);
                }
            }
        });
        case Type.GATEWAY_EVENT: {
            switch(action.payload.t) {
                case GatewayMessageDiscriminator.Ready: {
                    let p = action.payload.p;

                    let parties = new Map();
                    for(let party of p.parties) {
                        parties.set(party.id, { party, rooms: [] });
                    }
                    return { ...state, parties };
                }
            }
            break;
        }

    }

    return state;
}