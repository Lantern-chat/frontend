export enum Panel {
    LeftSidebar,
    Main,
    RightSidebar,
}

export interface IWindowState {
    width: number,
    use_mobile_view: boolean,
    show_panel: Panel,
    last_panel: Panel,
}

export const MOBILE_MAX_SIZE: number = 640;
export const DEFAULT_STATE: IWindowState = {
    width: window.innerWidth,
    use_mobile_view: window.innerWidth < MOBILE_MAX_SIZE,
    show_panel: Panel.Main,
    last_panel: Panel.Main,
};

import { Action, Type } from "../actions";

export function windowReducer(state: IWindowState = DEFAULT_STATE, action: Action) {
    switch(action.type) {
        case Type.WINDOW_RESIZE: {
            let width = window.innerWidth;
            return { ...state, width, use_mobile_view: width < MOBILE_MAX_SIZE };
        }
        case Type.WINDOW_TOGGLE_RIGHT_SIDEBAR: {
            let show_panel = state.show_panel === Panel.Main ? Panel.RightSidebar : Panel.Main;

            return { ...state, show_panel, last_panel: state.show_panel };
        }
        case Type.WINDOW_TOGGLE_LEFT_SIDEBAR: {
            let show_panel = state.show_panel === Panel.Main ? Panel.LeftSidebar : Panel.Main;

            return { ...state, show_panel, last_panel: state.show_panel };
        }
    }
    return state;
};