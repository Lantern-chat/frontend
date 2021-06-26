import { Dispatch as ReduxDispatch } from "redux";
import { History } from "history";
import { IHistoryState } from "./reducers";
import { Room, Message } from "./models";
import { RootState } from "state/root";
import { ISession } from "lib/session";

export enum Type {
    HISTORY_UPDATE = "HISTORY_UPDATE",

    SESSION_LOGIN = "SESSION_LOGIN",
    SESSION_EXPIRED = "SESSION_EXPIRED",

    WINDOW_RESIZE = "WINDOW_RESIZE",
    WINDOW_TOGGLE_RIGHT_SIDEBAR = "WINDOW_TOGGLE_RIGHT_SIDEBAR",
    WINDOW_TOGGLE_LEFT_SIDEBAR = "WINDOW_TOGGLE_LEFT_SIDEBAR",

    MODAL_OPEN_CREATE_PARTY = "MODAL_OPEN_CREATE_PARTY",
    MODAL_CLOSE_CREATE_PARTY = "MODAL_CLOSE_CREATE_PARTY",

    GATEWAY_EVENT = "GATEWAY_EVENT",

    ROOMS_LOADED = "ROOMS_LOADED",
    MESSAGES_LOADED = "MESSAGES_LOADED",

    MESSAGE_SEND = "MESSAGE_SEND",
    MESSAGE_SEND_EDIT = "MESSAGE_SEND_EDIT",
    MESSAGE_EDIT_PREV = "MESSAGE_EDIT_PREV",
    MESSAGE_EDIT_NEXT = "MESSAGE_EDIT_NEXT",
    MESSAGE_DISCARD_EDIT = "MESSAGE_DISCARD_EDIT",
}

export interface Dispatch extends ReduxDispatch<Action> {
    (action: DispatchableAction): void;
}

export type DispatchableAction = Action | ThunkAction | Promise<Action>;
export type ThunkAction = (dispatch: ReduxDispatch<Action>, getState: () => RootState) => void;

export type Action =
    HistoryUpdate |
    SessionLogin |
    SessionExpired |
    WindowResize |
    WindowToggleRightSidebar |
    WindowToggleLeftSidebar |
    ModalOpenCreateParty |
    ModalCloseCreateParty |
    GatewayEvent |
    RoomsLoaded |
    MessagesLoaded |
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
    ctx: IHistoryState,
}

// SESSION ACTIONS
export interface SessionExpired {
    type: Type.SESSION_EXPIRED,
}

export interface SessionLogin {
    type: Type.SESSION_LOGIN,
    session: ISession,
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

// GATEWAY ACTIONS

import { GatewayMessage } from "worker/gateway/msg";
export interface GatewayEvent {
    type: Type.GATEWAY_EVENT,
    payload: GatewayMessage
}

// PARTY ACTIONS

export interface RoomsLoaded {
    type: Type.ROOMS_LOADED,
    rooms: Room[],
}

export interface MessagesLoaded {
    type: Type.MESSAGES_LOADED,
    msgs: Message[]
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
