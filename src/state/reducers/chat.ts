import produce from "immer";

import dayjs, { Dayjs } from "dayjs";
import _ from "lodash";

import { Action, Type } from "../actions";

import { Message, Snowflake, Room } from "../models";

export interface IMessageState {
    msg: Message,
    ts: Dayjs,
}

export interface IRoomState {
    room: Room,
    msgs: IMessageState[],
    pending: IMessageState[],
    current_edit: null | Snowflake,
}
/*
export class RoomState {
    msgs: IMessageState[] = [];
    current_edit: null | Snowflake = null;

    insert(msg: Message): IMessageState {
        let msg_state = {
            ts: dayjs(msg.created_at),
            msg,
        };

        let idx = _.sortedIndexBy(this.msgs, msg_state, msg_state => msg_state.msg.id);

        this.msgs.splice(idx, 0, msg_state);

        return msg_state;
    }

    find(id: Snowflake): IMessageState | undefined {
        let search = { msg: { id } };

        let idx = _.sortedIndexBy<any>(this.msgs, search, msg_state => msg_state.msg.id);

        let msg_state = this.msgs[idx];

        if(msg_state && msg_state.msg.id == id) {
            return msg_state;
        } else {
            return undefined;
        }
    }

    last_msg(): IMessageState | undefined {
        return _.last(this.msgs);
    }
}
*/
export interface IChatState {
    rooms: Map<Snowflake, IRoomState>,
}

const DEFAULT_STATE: IChatState = {
    rooms: new Map(),
};

export function chatReducer(state: IChatState = DEFAULT_STATE, action: Action): IChatState {
    switch(action.type) {
        case Type.UNMOUNT: return DEFAULT_STATE;

        // fast filter before invoking Immer
        case Type.MESSAGE_SEND:
        case Type.MESSAGE_SEND_EDIT:
        case Type.MESSAGE_EDIT_NEXT:
        case Type.MESSAGE_EDIT_PREV:
        case Type.MESSAGE_DISCARD_EDIT: {
            return produce(state, draft => {
                switch(action.type) {
                    /*
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
                    */
                }
            });
        }
    }

    return state;
};