export interface IWindowState {
    width: number,
}

const DEFAULT_STATE: IWindowState = {
    width: window.innerWidth,
};

export interface WindowAction {
    type: string,
    payload: string,
}

export function windowReducer(state: IWindowState = DEFAULT_STATE, action: WindowAction) {
    switch(action.type) {
        case 'WINDOW_RESIZE': {
            return { width: window.innerWidth };
        }
    }
    return state;
};