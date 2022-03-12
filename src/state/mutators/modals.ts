import { mutatorWithDefault } from "solid-mutant";
import { Action, Type } from "../actions";

export interface IModalState {
    create_party_open: boolean,
}

export const modalMutator = mutatorWithDefault(() => ({ create_party_open: false }), (state: IModalState, action: Action) => {
    switch(action.type) {
        case Type.MODAL_OPEN_CREATE_PARTY: {
            state.create_party_open = true;
            break;
        }
        case Type.MODAL_CLOSE_CREATE_PARTY: {
            state.create_party_open = false;
            break;
        }
    }
});