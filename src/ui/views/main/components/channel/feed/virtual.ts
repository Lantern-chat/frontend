import { compareString } from "lib/compare";
import { binarySearch } from "lib/util";
import { Accessor, createMemo, createRenderEffect, createSignal, on, untrack } from "solid-js";
import { useDispatch } from "solid-mutant";
import { loadMessages, SearchMode } from "state/commands";

import { Snowflake } from "state/models";
import { IMessageState, IRoomState } from "state/mutators/chat";
import { useRootSelector } from "state/root";
import { activeRoom } from "state/selectors/active";
import { createOnPredicate } from "ui/hooks/createOnChange";

function searchRoom(room: DeepReadonly<IRoomState>, id: Snowflake): number {
    let { idx } = binarySearch(room.msgs as Array<DeepReadonly<IMessageState>>,
        (x: DeepReadonly<IMessageState>) => compareString(x.msg.id, id)
    );

    return idx;
}

function createMessageIndex(
    room: Accessor<DeepReadonly<IRoomState> | undefined>,
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
    feed: () => DeepReadonly<Array<IMessageState>>,
    on_load_prev: () => Promise<void>,
    on_load_next: () => Promise<void>,
] {
    let room = useRootSelector(state => {
        let ar = activeRoom(state);
        if(ar) {
            return state.chat.rooms[ar];
        };
        return;
    });

    let [start, setStart] = createSignal<Snowflake | undefined>(),
        [end, setEnd] = createSignal<Snowflake | undefined>();

    // specifically track this boolean, but memoize the changes
    let has_msgs = createMemo(() => room()?.msgs.length != 0);

    createRenderEffect(() => {
        let r = has_msgs() && room(); // will reset when room changes

        // we don't want to track initialization parameters
        untrack(() => {
            if(r) {
                // start at 100 into the past
                let start_idx = Math.max(0, r.msgs.length - 101);
                // end at last index
                let end_idx = r.msgs.length - 1;

                let first = r.msgs[start_idx],
                    last = r.msgs[end_idx];

                setStart(first.msg.id);
                setEnd(last.msg.id);
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

    // use `on` to untrack body, as the individual message parts are unimportant for tracking
    createRenderEffect(on(
        () => has_msgs() && room()?.msgs,
        msgs => {
            if(msgs) {
                let most_recent_id = msgs[msgs.length - 1].msg.id;
                if(end() != most_recent_id) {
                    setEnd(most_recent_id);
                }
            }
        }
    ));

    let dispatch = useDispatch();

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