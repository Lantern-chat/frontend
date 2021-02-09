export interface IWindowState {
    width: number,
    use_mobile_view: boolean,
}

const MOBILE_MAX_SIZE: number = 640;
const DEFAULT_STATE: IWindowState = {
    width: window.innerWidth,
    use_mobile_view: window.innerWidth < MOBILE_MAX_SIZE,
};

export interface WindowAction {
    type: string,
    payload: string,
}

export function windowReducer(state: IWindowState = DEFAULT_STATE, action: WindowAction) {
    switch(action.type) {
        case 'WINDOW_RESIZE': {
            let width = window.innerWidth;
            return { ...state, width, use_mobile_view: width < MOBILE_MAX_SIZE };
        }
    }
    return state;
};