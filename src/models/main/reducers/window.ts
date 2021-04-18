
import { IWindowState, DEFAULT_STATE, Panel, MOBILE_MAX_SIZE } from "../state/window";
import { WindowAction, WindowActionType } from "../actions/window";

export function windowReducer(state: IWindowState = DEFAULT_STATE, action: WindowAction) {
    switch(action.type) {
        case WindowActionType.WINDOW_RESIZE: {
            let width = window.innerWidth;
            return { ...state, width, use_mobile_view: width < MOBILE_MAX_SIZE };
        }
        case WindowActionType.WINDOW_TOGGLE_RIGHT_SIDEBAR: {
            return { ...state, show_panel: state.show_panel === Panel.Main ? Panel.RightSidebar : Panel.Main };
        }
    }
    return state;
};