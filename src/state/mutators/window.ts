export const enum Panel {
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
    showing_footers: boolean,
}

export const MOBILE_MAX_SIZE: number = 640;

import { mutatorWithDefault } from "solid-mutant";
import { StorageKey } from "state/storage";
import { Action, Type } from "../actions";

export const windowMutator = mutatorWithDefault(
    () => {
        let show_user_list = localStorage.getItem(StorageKey.SHOW_USER_LIST);

        return {
            width: window.innerWidth,
            height: window.innerHeight,
            use_mobile_view: window.innerWidth < MOBILE_MAX_SIZE,
            show_panel: Panel.Main,
            last_panel: Panel.Main,
            show_user_list: typeof show_user_list == 'string' ? JSON.parse(show_user_list) : true,
            showing_footers: false,
        };
    },
    (state: IWindowState, action: Action) => {
        switch(action.type) {
            case Type.WINDOW_RESIZE: {
                let width = window.innerWidth;
                state.width = width;
                state.use_mobile_view = width < MOBILE_MAX_SIZE;
                state.height = window.innerHeight;
                break;
            }
            case Type.WINDOW_TOGGLE_USER_LIST_SIDEBAR: {
                if(state.use_mobile_view) {
                    let new_panel = state.show_panel === Panel.Main ? Panel.RightUserList : Panel.Main;

                    state.last_panel = state.show_panel;
                    state.show_panel = new_panel;
                } else {
                    state.show_user_list = !state.show_user_list;
                }
                break;
            }
            case Type.WINDOW_TOGGLE_ROOM_LIST_SIDEBAR: {
                if(!state.use_mobile_view) break;

                let new_panel = state.show_panel === Panel.Main ? Panel.LeftRoomList : Panel.Main;
                state.last_panel = state.show_panel;
                state.show_panel = new_panel;
                break;
            }
            case Type.TOGGLE_FOOTERS: {
                state.showing_footers = action.show;
                break;
            }
        }
    }
);
