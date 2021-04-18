export interface IModalState {
    create_party_open: boolean,
}

const DEFAULT_STATE: IModalState = {
    create_party_open: false,
};

export interface ModalAction {
    type: string,
    payload: string,
}

export function modalReducer(state: IModalState = DEFAULT_STATE, action: ModalAction) {
    switch(action.type) {
        case 'MODAL_OPEN_CREATE_PARTY': {
            return { ...state, create_party_open: true };
        }
        case 'MODAL_CLOSE_CREATE_PARTY': {
            return { ...state, create_party_open: false };
        }
    }
    return state;
}