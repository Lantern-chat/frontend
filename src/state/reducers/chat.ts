import produce from "immer";

import dayjs, { Dayjs } from "dayjs";
import _ from "lodash";

import { Action, Type } from "../actions";

import { Message, Snowflake, Room } from "../models";
import { GatewayMessageDiscriminator } from "worker/gateway/msg";
import { GatewayEventCode } from "worker/gateway/event";
import { binarySearch } from "lib/util";

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





export interface IMessageState {
    msg: Message,
    ts: Dayjs,
}

export interface ITypingState {
    user: Snowflake,
    ts: number,
}

export interface IRoomState {
    room: Room,
    msgs: IMessageState[],
    pending: IMessageState[],
    current_edit: null | Snowflake,
    typing: ITypingState[],
}

export interface IChatState {
    rooms: Map<Snowflake, IRoomState>,
}

const DEFAULT_STATE: IChatState = {
    rooms: new Map(),
};

export function chatReducer(state: IChatState | null | undefined, action: Action): IChatState {
    state = state || DEFAULT_STATE;

    switch(action.type) {
        case Type.SESSION_EXPIRED: return DEFAULT_STATE;

        case Type.REFRESH_ACTIVE:
        case Type.HISTORY_UPDATE: {
            break;
        }

        case Type.PARTY_LOADED: return produce(state, draft => {
            for(let room of action.rooms) {
                if(draft.rooms.has(room.id)) continue;

                draft.rooms.set(room.id, {
                    room,
                    msgs: [],
                    pending: [],
                    current_edit: null,
                    typing: []
                });
            }
        });

        case Type.MESSAGES_LOADED: return produce(state, draft => {
            for(let msg of action.msgs) {
                let room = draft.rooms.get(msg.room_id);
                if(!room) continue;

                room.msgs.push({
                    msg,
                    ts: dayjs(msg.created_at),
                });
            }

            // sort message by timestamp
            for(let room of draft.rooms.values()) {
                room.msgs.sort((a, b) => a.ts.diff(b.ts));
            }
        });

        case Type.CLEANUP_TYPING: return produce(state, draft => {
            let now = Date.now();

            // for all rooms, retain typing indicators if only in the last 7 seconds
            for(let room of draft.rooms.values()) {
                room.typing = room.typing.filter(entry => (now - entry.ts) < 7000);
            }
        });

        case Type.GATEWAY_EVENT: {
            switch(action.payload.t) {
                case GatewayMessageDiscriminator.Event: {
                    let event = action.payload.p;
                    switch(event.o) {
                        case GatewayEventCode.MessageCreate: {
                            let raw_msg = event.p, msg = {
                                msg: raw_msg,
                                ts: dayjs(raw_msg.created_at)
                            };

                            return produce(state, draft => {
                                let room = draft.rooms.get(raw_msg.room_id);
                                if(!room) return;

                                // we try to keep the messages sorted by timestamp, and messages may not always
                                // arrive in order, so find where it should be inserted
                                let { idx, found } = binarySearch(room.msgs, m => m.ts.diff(msg.ts));

                                // message already exists (weird, but whatever)
                                if(found && room.msgs[idx].msg.id == raw_msg.id) return;

                                // insert message into the correct place to maintain sort order
                                room.msgs.splice(idx, 0, msg);

                                __DEV__ && console.log("Splicing message '%s' at index %d", raw_msg.content, idx);

                                // when a message is received, it should clear any typing indicator for the author
                                // of that message

                                // search for any users typing with this message's user ID
                                for(let idx = 0; idx < room.typing.length; idx++) {
                                    // if found, remove them from the typing list,
                                    // as the message that was just sent was probably what they were typing
                                    if(room.typing[idx].user == raw_msg.author.id) {
                                        room.typing.splice(idx, 1); // delete 1
                                        break;
                                    }
                                }
                            });
                        }
                        case GatewayEventCode.TypingStart: {
                            let { user, room: room_id } = event.p;

                            return produce(state, draft => {
                                let room = draft.rooms.get(room_id), ts = Date.now();
                                if(!room) return;

                                // search through typing entries for this room for any existing
                                // entries to refresh
                                for(let entry of room.typing) {
                                    if(entry.user == user) {
                                        entry.ts = ts; // refresh timestamp
                                        return; // early exit
                                    };
                                }

                                // if not found above (and returned early), push new typing entry
                                room.typing.push({ user, ts });
                            });
                        }
                    }

                    break;
                }
            }

            break;
        }

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