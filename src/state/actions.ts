import type { IHistoryState } from "./mutators";
import type { Snowflake, Room, Message, PartyMember, UserPreferences, UserProfile, User } from "./models";
import type { RootState } from "state/root";
import type { ISession } from "lib/session";

export enum Type {
    NEW_VERSION = "NEW_VERSION",
    API_ERROR = "API_ERROR",

    HISTORY_UPDATE = "HISTORY_UPDATE",

    SESSION_LOGIN = "SESSION_LOGIN",
    SESSION_EXPIRED = "SESSION_EXPIRED",

    REFRESH_ACTIVE = "REFRESH_ACTIVE",
    CLEANUP_TYPING = "CLEANUP_TYPING",

    WINDOW_RESIZE = "WINDOW_RESIZE",
    WINDOW_SET_PANEL = "WINDOW_SET_PANEL",
    WINDOW_TOGGLE_USER_LIST = "WINDOW_TOGGLE_USER_LIST",

    TOGGLE_FOOTERS = "TOGGLE_FOOTERS",

    MODAL_OPEN_CREATE_PARTY = "MODAL_OPEN_CREATE_PARTY",
    MODAL_CLOSE_CREATE_PARTY = "MODAL_CLOSE_CREATE_PARTY",

    OPEN_TOAST = "OPEN_TOAST",
    CLEAR_TOAST = "CLEAR_TOAST",

    UPDATE_PREFS = "UPDATE_PREFS",

    GATEWAY_EVENT = "GATEWAY_EVENT",
    GATEWAY_RETRY = "GATEWAY_RETRY",

    PARTY_LOADED = "PARTY_LOADED",
    LOCK_ROOM = "LOCK_ROOM",
    MESSAGES_LOADED = "MESSAGES_LOADED",
    MEMBERS_LOADED = "MEMBERS_LOADED",

    MESSAGE_SEND = "MESSAGE_SEND",
    MESSAGE_SEND_EDIT = "MESSAGE_SEND_EDIT",
    MESSAGE_EDIT_PREV = "MESSAGE_EDIT_PREV",
    MESSAGE_EDIT_NEXT = "MESSAGE_EDIT_NEXT",
    MESSAGE_DISCARD_EDIT = "MESSAGE_DISCARD_EDIT",

    USER_FETCHED = "USER_FETCHED",
    CACHE_USER = "CACHE_USER",

    MESSAGE_DRAFT = "MESSAGE_DRAFT",

    UPDATE_QUOTA = "UPDATE_QUOTA",
}

import type { DispatchableAction as MutantDispatchableAction } from "solid-mutant";

export type DispatchableAction = MutantDispatchableAction<Action, RootState>;

export type Action =
    | NewVersion
    | HistoryUpdate
    | SessionLogin
    | SessionExpired
    | UpdatePrefs
    | WindowResize
    | WindowSetPanel
    | WindowToggleUserList
    | ToggleFooters
    | ModalOpenCreateParty
    | ModalCloseCreateParty
    | OpenToast
    | ClearToast
    | GatewayEvent
    | GatewayRetry
    | PartyLoaded
    | LockRoom
    | MessagesLoaded
    | MembersLoaded
    | RefreshActive
    | CleanupTyping
    | MessageSend
    | MessageDiscordEdit
    | MessageEditPrev
    | MessageEditNext
    | MessageSendEdit
    | MessageDraft
    | UserFetched
    | CacheUser
    | UpdateQuota;

export interface NewVersion {
    type: Type.NEW_VERSION,
    version: string,
}

// HISTORY ACTIONS

import type { Update } from "history";
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

import type { Panel } from "./mutators/window";
export interface WindowSetPanel {
    type: Type.WINDOW_SET_PANEL,
    panel: Panel,
}

export interface WindowToggleUserList {
    type: Type.WINDOW_TOGGLE_USER_LIST,
    open: boolean,
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

import type { IToast } from "ui/components/toast";
export interface OpenToast {
    type: Type.OPEN_TOAST,
    toast: PartialBy<IToast, "id">,
}

export interface ClearToast {
    type: Type.CLEAR_TOAST,
    id: number,
}

// GATEWAY ACTIONS

import type { GatewayMessage } from "worker/gateway/msg";
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

export interface LockRoom {
    type: Type.LOCK_ROOM,
    room_id: Snowflake,
}

import type { SearchMode } from "./commands";
export interface MessagesLoaded {
    type: Type.MESSAGES_LOADED,
    room_id: Snowflake,
    msgs?: Message[],
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

export interface UserFetched {
    type: Type.USER_FETCHED,
    user: User,
    party_id?: Snowflake,
    profile: UserProfile,
}

import { CachedUser } from "./mutators/cache";
export interface CacheUser {
    type: Type.CACHE_USER,
    cached: CachedUser,
}

export interface CleanupTyping {
    type: Type.CLEANUP_TYPING
}

export interface UpdateQuota {
    type: Type.UPDATE_QUOTA,
    quota_used: number,
    quota_total: number,
}