import { binarySearch } from "lib/util";
import { same_day } from "lib/time";

import { Action, Type } from "../actions";

import { Message, Snowflake, Room, Attachment, ServerMsg, ServerMsgOpcode, Reaction, ReactionFull, ReactionShorthand } from "../models";
import { GatewayMessageDiscriminator } from "worker/gateway/msg";
import { ArraySet, ObjectMap } from "state/util/map_set";
import { SearchMode } from "state/commands/message/load";
import { RootState } from "state/root";

export interface IMessageState {
    msg: Message,

    /// Creation time
    ts: Date,

    /// Edit time
    et: Date | null,

    /// Starts Group?
    sg?: boolean,

    /// Starts Day?
    sd?: boolean,
}

export interface ITypingState {
    user_id: Snowflake,
    ts: Date,
}

export interface IAttachmentState {
    at: Attachment,
    msg: Message,
}

export interface IRoomState {
    room: Room,
    msgs: IMessageState[],
    attachments: IAttachmentState[],
    pending: IMessageState[],
    current_edit: null | Snowflake,
    typing: ITypingState[],
    locked: boolean,
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

    if(Math.abs(+msg.ts - +prev.ts) > (1000 * 60 * 5)) return true;
    if(msg.msg.author.id != prev.msg.author.id) return true;

    return false;
}

function starts_day(msg: IMessageState, prev: IMessageState | undefined) {
    return !prev || !same_day(msg.ts, prev.ts);
}

function set_starts(msgs: IMessageState[], idx: number) {
    let msg = msgs[idx], prev = msgs[idx - 1];
    if(msg) {
        msg.sg = starts_group(msg, prev);
        msg.sd = starts_day(msg, prev);
    }
}

export function chatMutator(root: RootState, action: Action) {
    let state = root.chat;
    if(!state) {
        state = root.chat = {
            rooms: {},
            active_party: '@me', // @me as a default will avoid odd behavior when loaded into a non-channel/non-home page
        }
    }

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
                        locked: false,
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
                room.typing = room.typing.filter(entry => (now - +entry.ts) < 7000);
            }

            break;
        }
        case Type.MESSAGE_DRAFT: {
            let room = state.rooms[action.room];
            if(room) { room.draft = action.draft; }
            break;
        }
        case Type.LOCK_ROOM: {
            let room = state.rooms[action.room_id];
            if(room) room.locked = true;
            break;
        }
        case Type.MESSAGES_LOADED: {
            let raw_msgs = action.msgs,
                room = state.rooms[action.room_id];

            if(room) {
                room.locked = false;

                if(raw_msgs) {
                    if(raw_msgs.length == 0) {
                        // only mark as fully loaded if search came up empty for messages before an ID
                        if(action.mode == SearchMode.Before) {
                            room.fully_loaded = true;
                        }
                        break;
                    }

                    let final_msgs: Array<IMessageState> = [],
                        old_msgs = room.msgs,
                        new_msgs = raw_msgs.map(msg => ({
                            msg,
                            ts: new Date(msg.created_at),
                            et: msg.edited_at ? new Date(msg.edited_at) : null,
                        })).sort((a, b) => +a.ts - +b.ts);

                    // TODO: Get the msg_id query term and avoid full merging
                    while(new_msgs.length && old_msgs.length) {
                        let n = new_msgs[0], o = old_msgs[0],
                            d = +n.ts - +o.ts, same = n.msg.id == o.msg.id;

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
                        set_starts(room.msgs, i);
                    }
                }
            }

            break;
        }

        case Type.GATEWAY_EVENT: {
            let ap = action.payload;

            if(ap.t != GatewayMessageDiscriminator.Event) {
                break;
            }

            let event: ServerMsg = ap.p;

            switch(event.o) {
                case ServerMsgOpcode.MessageDelete: {
                    let raw = event.p, room = state.rooms[raw.room_id];
                    if(!room) return;

                    let msg_idx = room.msgs.findIndex(msg => msg.msg.id == raw.id);
                    if(msg_idx < 0) return;

                    room.msgs.splice(msg_idx, 1);

                    // after message is removed, update the msg at the new index
                    set_starts(room.msgs, msg_idx);

                    break;
                }
                case ServerMsgOpcode.MessageCreate: {
                    let raw_msg = event.p, msg = {
                        msg: raw_msg,
                        ts: new Date(raw_msg.created_at),
                        et: raw_msg.edited_at ? new Date(raw_msg.edited_at) : null,
                    };

                    let room = state.rooms[raw_msg.room_id];
                    if(!room) return;

                    // we try to keep the messages sorted by timestamp, and messages may not always
                    // arrive in order, so find where it should be inserted
                    let { idx, found } = binarySearch(room.msgs, m => +m.ts - +msg.ts);

                    // message already exists (weird, but whatever)
                    if(found && room.msgs[idx].msg.id == raw_msg.id) return;

                    // insert message into the correct place to maintain sort order
                    room.msgs.splice(idx, 0, msg);

                    // after insertion, cascade check to start group
                    for(let i = idx; i < room.msgs.length; i++) {
                        set_starts(room.msgs, i);
                    }

                    __DEV__ && console.log("Splicing message '%s' at index %d", raw_msg.content, idx);

                    // when a message is received, it should clear any typing indicator for the author
                    // of that message

                    // search for any users typing with this message's user ID
                    for(let idx = 0; idx < room.typing.length; idx++) {
                        // if found, remove them from the typing list,
                        // as the message that was just sent was probably what they were typing
                        if(room.typing[idx].user_id == raw_msg.author.id) {
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
                            ts: new Date(raw_msg.created_at),
                            et: raw_msg.edited_at ? new Date(raw_msg.edited_at) : null,
                        }, { idx, found } = binarySearch(room.msgs, m => +m.ts - +msg.ts);

                        if(found && room.msgs[idx].msg.id == raw_msg.id) {
                            // NOTE: overwrite with msg except for sg
                            Object.assign(room.msgs[idx], msg);
                        }
                    }

                    break;
                }
                case ServerMsgOpcode.TypingStart: {
                    let { user_id, room_id } = event.p;
                    let room = state.rooms[room_id];
                    if(room) {
                        let ts = new Date();
                        // search through typing entries for this room for any existing
                        // entries to refresh
                        for(let entry of room.typing) {
                            if(entry.user_id == user_id) {
                                entry.ts = ts; // refresh timestamp
                                return; // early exit
                            };
                        }

                        // if not found above (and returned early), push new typing entry
                        room.typing.push({ user_id, ts });
                    }

                    break;
                }
                case ServerMsgOpcode.MessageReactionAdd:
                case ServerMsgOpcode.MessageReactionRemove: {
                    // NOTE: Message update events will overwrite the reactions field and remove users array

                    let { msg_id, room_id, user_id, emote } = event.p,
                        room = state.rooms[room_id];

                    if(room) {
                        let msg = room.msgs.find(m => m.msg.id == msg_id);

                        if(msg) {
                            msg.msg.reactions ||= [];

                            let reaction_idx = msg.msg.reactions.findIndex(r => 'emote' in r ? r.emote == emote['emote'] : r.emoji == emote['emoji']),
                                reaction: Reaction | undefined = msg.msg.reactions[reaction_idx],
                                own_reaction = user_id == root.user.user!.id,
                                added = event.o == ServerMsgOpcode.MessageReactionAdd;

                            if(reaction) {
                                // create users
                                let users = ArraySet((reaction as ReactionFull).users ||= []);

                                if(added) {
                                    users.delete(user_id);
                                    (reaction as ReactionShorthand).me ||= own_reaction;
                                } else {
                                    users.add(user_id);
                                    (reaction as ReactionShorthand).me &&= !own_reaction;
                                }

                                (reaction as ReactionShorthand).count += added ? 1 : -1;

                                if((reaction as ReactionShorthand).count == 0) {
                                    msg.msg.reactions.splice(reaction_idx, 1);
                                }
                            } else {
                                msg.msg.reactions.push({
                                    ...emote, // emote or emoji
                                    users: [user_id],
                                    me: own_reaction,
                                    count: 1,
                                });
                            }
                        }
                    }

                    break;
                }
            }

            break;
        }
    }
}