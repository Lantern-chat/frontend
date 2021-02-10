export enum Panel {
    LeftSidebar,
    Main,
    RightSidebar,
}

export interface IWindowState {
    width: number,
    use_mobile_view: boolean,
    show_panel: Panel,
}

const MOBILE_MAX_SIZE: number = 640;
const DEFAULT_STATE: IWindowState = {
    width: window.innerWidth,
    use_mobile_view: window.innerWidth < MOBILE_MAX_SIZE,
    show_panel: Panel.Main,
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
        case 'WINDOW_TOGGLE_RIGHT_SIDEBAR': {
            return { ...state, show_panel: state.show_panel === Panel.Main ? Panel.RightSidebar : Panel.Main };
        }
    }
    return state;
};