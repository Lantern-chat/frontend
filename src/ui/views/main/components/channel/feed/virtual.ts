import { compareString } from "lib/compare";
import { binarySearch } from "lib/util";
import { Accessor, batch, createMemo, createRenderEffect, createSignal, on, untrack } from "solid-js";
import { loadMessages, SearchMode } from "state/commands";

import { Snowflake } from "state/models";
import { IMessageState, IRoomState } from "state/mutators/chat";
import { useRootDispatch, useRootSelector } from "state/root";
import { activeRoom } from "state/selectors/active";
import { createOnPredicate } from "ui/hooks/createOnChange";

function searchRoom(room: IRoomState, id: Snowflake): number {
    let { idx } = binarySearch(room.msgs as Array<IMessageState>,
        (x: IMessageState) => compareString(x.msg.id, id)
    );

    return idx;
}

function createMessageIndex(
    room: Accessor<IRoomState | undefined>,
    id: Accessor<Snowflake | undefined>
): Accessor<number | undefined> {
    return createMemo(() => {
        let r = room(), i = id();
        if(r && i) {
            return searchRoom(r, i);
        }
        return;
    });
}

/*

The virtual feed represents a slice of the full feed in the store.

Process:
    On hitting the top:
        Try to display up to 100 more messages
        If reached the start of the full feed:
            begin loading more messages, deferring the IFS from updating
            listen for changes to room.is_loading, when false, repeat initial logic
*/

export function createVirtualizedFeed(): [
    feed: () => Array<IMessageState>,
    on_load_prev: () => Promise<void>,
    on_load_next: () => Promise<void>,
] {
    let real_room = useRootSelector(state => {
        let ar = activeRoom(state);
        if(ar) {
            return state.chat.rooms[ar];
        };
        return;
    });

    // indirection to ensure initialization effect runs first
    let [room, setRoom] = createSignal<IRoomState>();

    let [start, setStart] = createSignal<Snowflake | undefined>(),
        [end, setEnd] = createSignal<Snowflake | undefined>();

    // specifically track this boolean, but memoize the changes
    let has_msgs = createMemo(() => real_room()?.msgs.length != 0);

    createRenderEffect(() => {
        let r = has_msgs() && real_room(); // will reset when room changes or messages load

        // we don't want to track initialization parameters
        untrack(() => {
            if(r) {
                // start at 100 into the past
                let start_idx = Math.max(0, r.msgs.length - 101);
                // end at last index
                let end_idx = r.msgs.length - 1;

                let first = r.msgs[start_idx],
                    last = r.msgs[end_idx];

                batch(() => {
                    setRoom(r as any);
                    setStart(first.msg.id);
                    setEnd(last.msg.id);
                });
            }
        });
    });

    let start_idx = createMessageIndex(room, start),
        end_idx = createMessageIndex(room, end);

    let feed = createMemo(() => {
        let r = room(), s = start_idx(), e = end_idx();

        if(r && s != null && e != null) {
            return r.msgs.slice(s, e + 1);
        }
        return [];
    });

    createRenderEffect(() => {
        let r = room(), l: number | undefined;

        // NOTE: This tracks `length`
        if(l = r?.msgs.length) {
            untrack(() => setEnd(r!.msgs[l! - 1].msg.id));
        }
    });

    let dispatch = useRootDispatch();

    let on_loading_end = createOnPredicate(
        () => room()?.is_loading,
        loading => loading === false
    );

    let on_load_prev = async () => {
        let r = room()!;

        // move the start pointer back 100
        let new_start_idx = Math.max(0, start_idx()! - 100);
        let new_start_id = r.msgs[new_start_idx].msg.id;

        // if at the very start of message list
        if(new_start_idx == 0) {
            // fetch more from server
            dispatch(loadMessages(room()!.room.id, new_start_id, SearchMode.Before));

            // wait for loading to end
            await on_loading_end();

            // check if room changed during loading
            if(r.room.id != room()?.room.id) {
                return;
            }

            // same logic as before
            new_start_idx = Math.max(0, searchRoom(r, new_start_id) - 100);
            new_start_id = r.msgs[new_start_idx].msg.id;
        }

        setStart(new_start_id);
    };

    let on_load_next = async () => {

    };

    return [feed, on_load_prev, on_load_next];
}