import { Action, Type } from "../actions";

import { Snowflake, Party } from "../models";

export interface IPartyState {
    parties: Map<Snowflake, Party>,
    sorted: Snowflake[]
}

const DEFAULT_STATE: IPartyState = {
    parties: new Map(),
    sorted: [],
};

export function partyReducer(state: IPartyState = DEFAULT_STATE, action: Action) {
    switch(action.type) {
        case Type.UNMOUNT: return DEFAULT_STATE;
    }

    return state;
}