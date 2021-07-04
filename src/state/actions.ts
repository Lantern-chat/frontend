import { Dispatch as ReduxDispatch } from "redux";
import { History } from "history";
import { IHistoryState } from "./reducers";
import { Snowflake, Room, Message, PartyMember } from "./models";
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

    SET_THEME = "SET_THEME",

    GATEWAY_EVENT = "GATEWAY_EVENT",
    GATEWAY_RETRY = "GATEWAY_RETRY",

    PARTY_LOADED = "PARTY_LOADED",
    MESSAGES_LOADED = "MESSAGES_LOADED",
    MEMBERS_LOADED = "MEMBERS_LOADED",

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
export type ThunkAction = (dispatch: <T extends DispatchableAction>(action: T) => T, getState: () => RootState) => void;

export type Action =
    HistoryUpdate |
    SessionLogin |
    SessionExpired |
    SetTheme |
    WindowResize |
    WindowToggleRightSidebar |
    WindowToggleLeftSidebar |
    ModalOpenCreateParty |
    ModalCloseCreateParty |
    GatewayEvent |
    GatewayRetry |
    PartyLoaded |
    MessagesLoaded |
    MembersLoaded |
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

// THEME ACTIONS

export interface SetTheme {
    type: Type.SET_THEME,
    temperature: number,
    is_light: boolean,
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

export interface GatewayRetry {
    type: Type.GATEWAY_RETRY,
}

// PARTY ACTIONS

export interface PartyLoaded {
    type: Type.PARTY_LOADED,
    party_id: Snowflake,
    rooms: Room[],
}

export interface MessagesLoaded {
    type: Type.MESSAGES_LOADED,
    room_id: Snowflake,
    msgs: Message[]
}

export interface MembersLoaded {
    type: Type.MEMBERS_LOADED,
    party_id: Snowflake,
    members: PartyMember[],
}

// MESSAGE ACTIONS

export interface MessageSend {
    type: Type.MESSAGE_SEND,
    msg: Message,
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
