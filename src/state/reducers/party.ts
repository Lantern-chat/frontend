import produce from "immer";
import { GatewayMessageDiscriminator } from "worker/gateway/msg";
import { PartyMember } from "../../../../backend/crates/models/models";
import { Action, Type } from "../actions";

import { Snowflake, Party, Room } from "../models";

export interface IParty {
    party: Party,
    rooms: Room[],
    members: PartyMember[],
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

        case Type.PARTY_LOADED: return produce(state, draft => {
            action.rooms.sort((a, b) => a.sort_order - b.sort_order);

            for(let room of action.rooms) {
                if(room.party_id) {
                    draft.parties.get(room.party_id)?.rooms.push(room);
                }
            }
        });
        case Type.HISTORY_UPDATE: {
            let [, party_id, channel_id] = action.ctx.parts;

            return produce(state, draft => {
                let party = draft.parties.get(party_id);
                if(party) {
                    let room = party.rooms.find(room => room.id == channel_id);

                    if(room) {
                        draft.last_channel.set(party_id, channel_id);
                    }
                }
            });
        }
        case Type.GATEWAY_EVENT: {
            switch(action.payload.t) {
                case GatewayMessageDiscriminator.Ready: {
                    let p = action.payload.p;

                    let parties: Map<Snowflake, IParty> = new Map();
                    for(let party of p.parties) {
                        parties.set(party.id, { party, rooms: [], members: [] });
                    }
                    return { ...state, parties };
                }
            }
            break;
        }

    }

    return state;
}