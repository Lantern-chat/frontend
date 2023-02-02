export const enum Panel {
    LeftRoomList,
    Main,
    RightUserList,
}

export interface IWindowState {
    latest_version: string,
    width: number,
    height: number,
    use_mobile_view: boolean,
    show_panel: Panel,
    last_panel: Panel,
    show_user_list: boolean,
    showing_footers: boolean,
}

export const MOBILE_MAX_SIZE: number = 640;

import { RootState } from "state/root";
import { StorageKey } from "state/storage";
import { Action, Type } from "../actions";

export function windowMutator(root: RootState, action: Action) {
    let state = root.window;
    if(!state) {
        let show_user_list = localStorage.getItem(StorageKey.SHOW_USER_LIST);

        state = root.window = {
            latest_version: __VERSION__,
            width: window.innerWidth,
            height: window.innerHeight,
            use_mobile_view: window.innerWidth < MOBILE_MAX_SIZE,
            show_panel: Panel.Main,
            last_panel: Panel.Main,
            show_user_list: typeof show_user_list == 'string' ? JSON.parse(show_user_list) : true,
            showing_footers: false,
        };
    }

    switch(action.type) {
        case Type.NEW_VERSION: {
            state.latest_version = action.version;
            break;
        }
        case Type.WINDOW_RESIZE: {
            let width = window.innerWidth;
            state.width = width;
            state.use_mobile_view = width < MOBILE_MAX_SIZE;
            state.height = window.innerHeight;
            break;
        }
        case Type.WINDOW_SET_PANEL: {
            state.last_panel = state.show_panel;
            state.show_panel = action.panel;
            break;
        }
        case Type.WINDOW_TOGGLE_USER_LIST: {
            state.show_user_list = action.open;
            break;
        }
        case Type.TOGGLE_FOOTERS: {
            state.showing_footers = action.show;
            break;
        }
    }
}