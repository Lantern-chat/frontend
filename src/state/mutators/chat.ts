import dayjs, { Dayjs } from "lib/time";
import { binarySearch } from "lib/util";

import { Action, Type } from "../actions";

import { Message, Snowflake, Room, Attachment, ServerMsg, ServerMsgOpcode } from "../models";
import { GatewayMessageDiscriminator } from "worker/gateway/msg";
import { mutatorWithDefault } from "solid-mutant";
import { ObjectMap } from "state/util/map_set";

export interface IMessageState {
    msg: Message,
    // unix timestamp
    ts: number,
    // unix timestamp for edit time
    et: number | null,

    /// Starts Group?
    sg?: boolean,
}

export interface ITypingState {
    user: Snowflake,
    ts: number,
}

export interface IAttachmentState {
    at: Attachment,
    msg: Message,
}

export interface IRoomState {
    room: Room,
    msgs: Array<IMessageState>,
    attachments: IAttachmentState[],
    pending: IMessageState[],
    current_edit: null | Snowflake,
    typing: ITypingState[],
    is_loading: boolean,
    fully_loaded: boolean,
    draft: string,
}

export interface IChatState {
    rooms: Record<Snowflake, IRoomState>, // ObjectMap
    active_party?: Snowflake,
    active_room?: Snowflake,
}

function starts_group(msg: IMessageState, prev: IMessageState | undefined) {
    if(!prev) return true;

    if(Math.abs(msg.ts - prev.ts) > (1000 * 60 * 5)) return true;
    if(msg.msg.author.id != prev.msg.author.id) return true;

    return false;
}

function set_starts_group(msgs: IMessageState[], idx: number) {
    let msg = msgs[idx], prev = msgs[idx - 1];
    if(msg) {
        msg.sg = starts_group(msg, prev);
    }
}

export const chatMutator = mutatorWithDefault(
    () => ({
        rooms: {},
        // @me as a default will avoid odd behavior when loaded into a non-channel/non-home page
        active_party: '@me',
    }),
    (state: IChatState, action: Action) => {
        switch(action.type) {
            case Type.SESSION_EXPIRED: {
                state.rooms = {}; // reset to default
                break;
            }
            case Type.REFRESH_ACTIVE:
            case Type.HISTORY_UPDATE: {
                let parts = action.ctx.parts;
                if(parts[0] === 'channels') {
                    state.active_party = parts[1];
                    state.active_room = parts[2];
                }
                break;
            }
            case Type.PARTY_LOADED: {
                let rooms = state.rooms;
                for(let room of action.rooms) {
                    if(!rooms[room.id]) {
                        rooms[room.id] = {
                            room,
                            msgs: [],
                            attachments: [],
                            pending: [],
                            current_edit: null,
                            typing: [],
                            is_loading: false,
                            fully_loaded: false,
                            draft: "",
                        };
                    }
                }

                break;
            }
            case Type.CLEANUP_TYPING: {
                let now = Date.now(), rooms = state.rooms;

                // for all rooms, retain typing indicators if only in the last 7 seconds
                for(let room_id in rooms) {
                    let room = rooms[room_id];
                    if(room.typing.length == 0) continue;
                    room.typing = room.typing.filter(entry => (now - entry.ts) < 7000);
                }

                break;
            }
            case Type.MESSAGE_DRAFT: {
                let room = state.rooms[action.room];
                if(room) { room.draft = action.draft; }
                break;
            }
            case Type.MESSAGES_LOADING: {
                let room = state.rooms[action.room_id];
                if(room) room.is_loading = true;
                break;
            }
            case Type.MESSAGES_LOADED: {
                let raw_msgs = action.msgs;

                let room = state.rooms[action.room_id];
                if(!room) break;

                room.is_loading = false;

                if(raw_msgs.length == 0) {
                    // only mark as fully loaded if search came up empty for messages before an ID
                    //if(action.mode == SearchMode.Before) {
                    //    room.fully_loaded = true;
                    //}
                    break;
                }

                let final_msgs: Array<IMessageState> = [],
                    old_msgs = room.msgs,
                    new_msgs = raw_msgs.map(msg => ({
                        msg,
                        ts: +dayjs(msg.created_at),
                        et: msg.edited_at ? +dayjs(msg.edited_at) : null,
                    })).sort((a, b) => a.ts - b.ts);

                // TODO: Get the msg_id query term and avoid full merging
                while(new_msgs.length && old_msgs.length) {
                    let n = new_msgs[0], o = old_msgs[0],
                        d = n.ts - o.ts, same = n.msg.id == o.msg.id;

                    if(d < 0) {
                        final_msgs.push(new_msgs.shift()!);
                    } else {
                        final_msgs.push(old_msgs.shift()!);

                        if(same) {
                            // skip new message if same
                            new_msgs.shift();
                        }
                    }
                }

                room.msgs = [...final_msgs, ...new_msgs, ...old_msgs];

                for(let i = 0; i < room.msgs.length; i++) {
                    set_starts_group(room.msgs, i);
                }

                break;
            }

            case Type.GATEWAY_EVENT: {
                let ap = action.payload;

                switch(ap.t) {
                    case GatewayMessageDiscriminator.Event: {
                        let event: ServerMsg = ap.p;

                        switch(event.o) {
                            case ServerMsgOpcode.MessageDelete: {
                                let raw = event.p, room = state.rooms[raw.room_id];
                                if(!room) return;

                                let msg_idx = room.msgs.findIndex(msg => msg.msg.id == raw.id);
                                if(msg_idx < 0) return;

                                room.msgs.splice(msg_idx, 1);

                                // after message is removed, update the msg at the new index
                                set_starts_group(room.msgs, msg_idx);

                                break;
                            }
                            case ServerMsgOpcode.MessageCreate: {
                                let raw_msg = event.p, msg = {
                                    msg: raw_msg,
                                    ts: +dayjs(raw_msg.created_at),
                                    et: raw_msg.edited_at ? +dayjs(raw_msg.edited_at) : null,
                                };

                                let room = state.rooms[raw_msg.room_id];
                                if(!room) return;

                                // we try to keep the messages sorted by timestamp, and messages may not always
                                // arrive in order, so find where it should be inserted
                                let { idx, found } = binarySearch(room.msgs, m => m.ts - msg.ts);

                                // message already exists (weird, but whatever)
                                if(found && room.msgs[idx].msg.id == raw_msg.id) return;

                                // insert message into the correct place to maintain sort order
                                room.msgs.splice(idx, 0, msg);

                                // after insertion, cascade check to start group
                                for(let i = idx; i < room.msgs.length; i++) {
                                    set_starts_group(room.msgs, i);
                                }

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

                                break;
                            }
                            case ServerMsgOpcode.MessageUpdate: {
                                let raw_msg = event.p, room = state.rooms[raw_msg.room_id];
                                if(room) {
                                    let msg: IMessageState = {
                                        msg: raw_msg,
                                        ts: +dayjs(raw_msg.created_at),
                                        et: raw_msg.edited_at ? +dayjs(raw_msg.edited_at) : null,
                                    }, { idx, found } = binarySearch(room.msgs, m => m.ts - msg.ts);

                                    if(found && room.msgs[idx].msg.id == raw_msg.id) {
                                        // NOTE: overwrite with msg except for sg
                                        Object.assign(room.msgs[idx], msg);
                                    }
                                }

                                break;
                            }
                            case ServerMsgOpcode.TypingStart: {
                                let { user, room: room_id } = event.p;
                                let room = state.rooms[room_id];
                                if(room) {
                                    let ts = Date.now();
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
                                }

                                break;
                            }
                        }

                        break;
                    }
                }

                break;
            }
        }
    }
);