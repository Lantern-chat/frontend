export interface WindowAction {
    type: WindowActionType,
    payload: string,
}

export enum WindowActionType {
    WINDOW_RESIZE = "WINDOW_RESIZE",
    WINDOW_TOGGLE_RIGHT_SIDEBAR = "WINDOW_TOGGLE_RIGHT_SIDEBAR",
}

export const windowResize = () => ({ type: WindowActionType.WINDOW_RESIZE });
export const windowToggleRightSidebar = () => ({ type: WindowActionType.WINDOW_TOGGLE_RIGHT_SIDEBAR });