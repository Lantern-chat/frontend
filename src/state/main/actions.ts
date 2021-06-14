export enum Type {
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

export type Action =
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

// APPLICATION ACTIONS

import { ISession } from "lib/session";
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