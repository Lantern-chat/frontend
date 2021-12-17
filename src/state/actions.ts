import { Dispatch as ReduxDispatch } from "redux";
import { History } from "history";
import { IHistoryState } from "./reducers";
import { Snowflake, Room, Message, PartyMember, UserPreferences, ApiError as RawApiError } from "./models";
import { RootState } from "state/root";
import { ISession } from "lib/session";

export enum Type {
    API_ERROR = "API_ERROR",

    HISTORY_UPDATE = "HISTORY_UPDATE",

    SESSION_LOGIN = "SESSION_LOGIN",
    SESSION_EXPIRED = "SESSION_EXPIRED",

    REFRESH_ACTIVE = "REFRESH_ACTIVE",
    CLEANUP_TYPING = "CLEANUP_TYPING",

    WINDOW_RESIZE = "WINDOW_RESIZE",
    WINDOW_TOGGLE_USER_LIST_SIDEBAR = "WINDOW_TOGGLE_USER_LIST_SIDEBAR",
    WINDOW_TOGGLE_ROOM_LIST_SIDEBAR = "WINDOW_TOGGLE_ROOM_LIST_SIDEBAR",

    TOGGLE_FOOTERS = "TOGGLE_FOOTERS",

    MODAL_OPEN_CREATE_PARTY = "MODAL_OPEN_CREATE_PARTY",
    MODAL_CLOSE_CREATE_PARTY = "MODAL_CLOSE_CREATE_PARTY",

    OPEN_TOAST = "OPEN_TOAST",
    CLEAR_TOAST = "CLEAR_TOAST",

    UPDATE_PREFS = "UPDATE_PREFS",

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

    MESSAGE_DRAFT = "MESSAGE_DRAFT",

    UPDATE_QUOTA = "UPDATE_QUOTA",
}

export interface Dispatch extends ReduxDispatch<Action> {
    (action: DispatchableAction): void;
}

export type DispatchableAction = Action | ThunkAction | Promise<Action>;
export type ThunkAction = (dispatch: <T extends DispatchableAction>(action: T) => T, getState: () => RootState) => void;

export type Action =
    ApiError |
    HistoryUpdate |
    SessionLogin |
    SessionExpired |
    UpdatePrefs |
    WindowResize |
    WindowToggleUserListSidebar |
    WindowToggleRoomListSidebar |
    ToggleFooters |
    ModalOpenCreateParty |
    ModalCloseCreateParty |
    OpenToast |
    ClearToast |
    GatewayEvent |
    GatewayRetry |
    PartyLoaded |
    MessagesLoaded |
    MembersLoaded |
    RefreshActive |
    CleanupTyping |
    MessageSend |
    MessageDiscordEdit |
    MessageEditPrev |
    MessageEditNext |
    MessageSendEdit |
    MessageDraft |
    UpdateQuota;

export interface ApiError {
    type: Type.API_ERROR,
    error: RawApiError,
}

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

// PREFS ACTIONS

export interface UpdatePrefs {
    type: Type.UPDATE_PREFS,
    prefs: Partial<UserPreferences>,
}

// WINDOW ACTIONS

export interface WindowResize {
    type: Type.WINDOW_RESIZE,
}

export interface WindowToggleUserListSidebar {
    type: Type.WINDOW_TOGGLE_USER_LIST_SIDEBAR,
}

export interface WindowToggleRoomListSidebar {
    type: Type.WINDOW_TOGGLE_ROOM_LIST_SIDEBAR,
}

export interface ToggleFooters {
    type: Type.TOGGLE_FOOTERS,
    show: boolean,
}

// MODAL ACTIONS

export interface ModalOpenCreateParty {
    type: Type.MODAL_OPEN_CREATE_PARTY,
}

export interface ModalCloseCreateParty {
    type: Type.MODAL_CLOSE_CREATE_PARTY
}

import { IToast } from "ui/components/toast";
export interface OpenToast {
    type: Type.OPEN_TOAST,
    toast: PartialBy<IToast, 'id'>,
}

export interface ClearToast {
    type: Type.CLEAR_TOAST,
    id: number,
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

import { SearchMode } from "./commands";
export interface MessagesLoaded {
    type: Type.MESSAGES_LOADED,
    room_id: Snowflake,
    msgs: Message[],
    mode: SearchMode,
}

export interface MembersLoaded {
    type: Type.MEMBERS_LOADED,
    party_id: Snowflake,
    members: PartyMember[],
}

export interface RefreshActive {
    type: Type.REFRESH_ACTIVE,
    ctx: IHistoryState,
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

export interface MessageDraft {
    type: Type.MESSAGE_DRAFT,
    room: Snowflake,
    draft: string,
}

// MISC ACTIONS

export interface CleanupTyping {
    type: Type.CLEANUP_TYPING
}

export interface UpdateQuota {
    type: Type.UPDATE_QUOTA,
    quota_used: number,
    quota_total: number,
}