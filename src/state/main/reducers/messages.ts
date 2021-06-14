import dayjs, { Dayjs } from "dayjs";

import { Action, Type } from "../actions";

export interface IMessage {
    id: number,
    ts: Dayjs,
    msg: string,
}

export interface IMessageState {
    message_ids: string[],
    messages: IMessage[],
    current_edit: null | number,
}

const DEFAULT_STATE: IMessageState = {
    message_ids: [],
    messages: [],
    current_edit: null,
};

let counter = 0;

export function messageReducer(state: IMessageState = DEFAULT_STATE, action: Action): IMessageState {
    switch(action.type) {
        case Type.UNMOUNT:
            return DEFAULT_STATE;

        case Type.MESSAGE_SEND: {
            counter += 1;
            return {
                ...state,
                messages: [...state.messages, {
                    id: counter,
                    msg: action.payload.trim(),
                    ts: dayjs(),
                }]
            };
        }
        case Type.MESSAGE_DISCARD_EDIT: {
            return { ...state, current_edit: null };
        }
        case Type.MESSAGE_EDIT_PREV: {
            if(state.messages.length == 0) break;

            let current_edit = state.current_edit;
            if(current_edit != null) {
                let idx = state.messages.findIndex((msg) => msg.id == current_edit);
                if(idx > 0) {
                    current_edit = state.messages[idx - 1].id;
                }
            } else {
                current_edit = state.messages[state.messages.length - 1].id;
            }

            return { ...state, current_edit };
        }
        case Type.MESSAGE_EDIT_NEXT: {
            if(state.messages.length == 0) break;

            let current_edit = state.current_edit;
            if(current_edit != null) {
                let idx = state.messages.findIndex((msg) => msg.id == current_edit);
                if(idx < state.messages.length - 1) {
                    current_edit = state.messages[idx + 1].id;
                } else {
                    current_edit = null;
                }
            }

            return { ...state, current_edit };
        }
        case Type.MESSAGE_SEND_EDIT: {
            let current_edit = state.current_edit;
            if(current_edit != null) {
                let idx = state.messages.findIndex((msg) => msg.id == current_edit);
                if(idx != -1) {
                    let messages = state.messages.slice();
                    messages[idx] = {
                        ...messages[idx],
                        msg: action.payload.trim(),
                    };

                    return { ...state, current_edit: null, messages };
                }
            }

            break;
        }
    }

    return state;
};