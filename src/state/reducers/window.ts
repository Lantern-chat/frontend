export enum Panel {
    LeftRoomList,
    Main,
    RightUserList,
}

export interface IWindowState {
    width: number,
    height: number,
    use_mobile_view: boolean,
    show_panel: Panel,
    last_panel: Panel,
    show_user_list: boolean,
}

export const MOBILE_MAX_SIZE: number = 640;
export const DEFAULT_STATE: IWindowState = {
    width: window.innerWidth,
    height: window.innerHeight,
    use_mobile_view: window.innerWidth < MOBILE_MAX_SIZE,
    show_panel: Panel.Main,
    last_panel: Panel.Main,
    show_user_list: true,
};

import { Action, Type } from "../actions";

export function windowReducer(state: IWindowState = DEFAULT_STATE, action: Action) {
    switch(action.type) {
        case Type.WINDOW_RESIZE: {
            let width = window.innerWidth;
            return { ...state, width, use_mobile_view: width < MOBILE_MAX_SIZE, height: window.innerHeight };
        }
        case Type.WINDOW_TOGGLE_USER_LIST_SIDEBAR: {
            if(state.use_mobile_view) {
                let show_panel = state.show_panel === Panel.Main ? Panel.RightUserList : Panel.Main;
                return { ...state, show_panel, last_panel: state.show_panel };
            } else {
                return { ...state, show_user_list: !state.show_user_list };
            }
        }
        case Type.WINDOW_TOGGLE_ROOM_LIST_SIDEBAR: {
            if(!state.use_mobile_view) break;

            let show_panel = state.show_panel === Panel.Main ? Panel.LeftRoomList : Panel.Main;
            return { ...state, show_panel, last_panel: state.show_panel };
        }
    }
    return state;
};