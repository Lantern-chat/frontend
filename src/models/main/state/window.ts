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

export const MOBILE_MAX_SIZE: number = 640;
export const DEFAULT_STATE: IWindowState = {
    width: window.innerWidth,
    use_mobile_view: window.innerWidth < MOBILE_MAX_SIZE,
    show_panel: Panel.Main,
};
