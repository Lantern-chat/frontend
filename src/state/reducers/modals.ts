import { Action, Type } from "../actions";

export interface IModalState {
    create_party_open: boolean,
}

const DEFAULT_STATE: IModalState = {
    create_party_open: false,
};

export function modalReducer(state: IModalState = DEFAULT_STATE, action: Action) {
    switch(action.type) {
        case Type.MODAL_OPEN_CREATE_PARTY: {
            return { ...state, create_party_open: true };
        }
        case Type.MODAL_CLOSE_CREATE_PARTY: {
            return { ...state, create_party_open: false };
        }
    }

    return state;
}