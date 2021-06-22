import { RootState } from "./root";

export enum Type {
    HISTORY_UPDATE = "HISTORY_UPDATE",

    SESSION_EXPIRED = "SESSION_EXPIRED",
    SESSION_LOGIN = "SESSION_LOGIN",
    SESSION_LOGOUT = "SESSION_LOGOUT",

    WINDOW_RESIZE = "WINDOW_RESIZE",
    WINDOW_TOGGLE_RIGHT_SIDEBAR = "WINDOW_TOGGLE_RIGHT_SIDEBAR",
    WINDOW_TOGGLE_LEFT_SIDEBAR = "WINDOW_TOGGLE_LEFT_SIDEBAR",

    MODAL_OPEN_CREATE_PARTY = "MODAL_OPEN_CREATE_PARTY",
    MODAL_CLOSE_CREATE_PARTY = "MODAL_CLOSE_CREATE_PARTY",

    MOUNT = "MOUNT",
    UNMOUNT = "UNMOUNT",

    GATEWAY_EVENT = "GATEWAY_EVENT",

    MESSAGE_SEND = "MESSAGE_SEND",
    MESSAGE_SEND_EDIT = "MESSAGE_SEND_EDIT",
    MESSAGE_EDIT_PREV = "MESSAGE_EDIT_PREV",
    MESSAGE_EDIT_NEXT = "MESSAGE_EDIT_NEXT",
    MESSAGE_DISCARD_EDIT = "MESSAGE_DISCARD_EDIT",
}

export interface LanternDispatch extends Dispatch<Action> {
    (action: DispatchableAction): void;
}

export type DispatchableAction = Action | ThunkAction | Promise<Action>;
export type ThunkAction = (dispatch: Dispatch<Action>, getState: () => RootState) => void;

export type Action =
    HistoryUpdate |
    SessionExpired |
    SessionLogin |
    SessionLogout |
    WindowResize |
    WindowToggleRightSidebar |
    WindowToggleLeftSidebar |
    ModalOpenCreateParty |
    ModalCloseCreateParty |
    Mount |
    Unmount |
    GatewayEvent |
    MessageSend |
    MessageDiscordEdit |
    MessageEditPrev |
    MessageEditNext |
    MessageSendEdit;

// HISTORY ACTIONS

import { Update } from "history";
export interface HistoryUpdate {
    type: Type.HISTORY_UPDATE,
    update: Update,
}

// SESSION ACTIONS
export interface SessionExpired {
    type: Type.SESSION_EXPIRED,
}

export interface SessionLogin {
    type: Type.SESSION_LOGIN,
    session: ISession,
}

export interface SessionLogout {
    type: Type.SESSION_LOGOUT,
}

// WINDOW ACTIONS

export interface WindowResize {
    type: Type.WINDOW_RESIZE,
}

export interface WindowToggleRightSidebar {
    type: Type.WINDOW_TOGGLE_RIGHT_SIDEBAR,
}

export interface WindowToggleLeftSidebar {
    type: Type.WINDOW_TOGGLE_LEFT_SIDEBAR,
}

// MODAL ACTIONS

export interface ModalOpenCreateParty {
    type: Type.MODAL_OPEN_CREATE_PARTY,
}

export interface ModalCloseCreateParty {
    type: Type.MODAL_CLOSE_CREATE_PARTY
}

import { History } from "history";
// APPLICATION ACTIONS

import { ISession } from "lib/session";
import { Dispatch } from "redux";
export interface Mount {
    type: Type.MOUNT,
    payload: ISession,
}

export interface Unmount {
    type: Type.UNMOUNT,
}

// GATEWAY ACTIONS

import { GatewayMessage } from "worker/gateway/msg";
export interface GatewayEvent {
    type: Type.GATEWAY_EVENT,
    payload: GatewayMessage
}

// MESSAGE ACTIONS

export interface MessageSend {
    type: Type.MESSAGE_SEND,
    payload: string,
}

export interface MessageDiscordEdit {
    type: Type.MESSAGE_DISCARD_EDIT
}

export interface MessageEditPrev {
    type: Type.MESSAGE_EDIT_PREV
}

export interface MessageEditNext {
    type: Type.MESSAGE_EDIT_NEXT
}

export interface MessageSendEdit {
    type: Type.MESSAGE_SEND_EDIT,
    payload: string,
}
