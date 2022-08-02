import { createMemo, Show } from "solid-js";

import type { Room } from "state/models";
import { usePrefs } from "state/contexts/prefs";
import { asset_url } from "config/urls";

import { Avatar } from "ui/components/common/avatar";
import { VectorIcon } from "ui/components/common/icon";

import { Icons } from "lantern-icons";

interface IRoomIconProps {
    room: Room,
}

export function RoomIcon(props: IRoomIconProps) {
    let prefs = usePrefs();

    return (
        <div class="ln-channel-list__icon">
            <div class="ln-channel-list__icon-wrapper">
                <Show when={props.room.avatar} fallback={<RoomHashIcon room={props.room} />}>
                    <Avatar url={asset_url('room', props.room.id, props.room.avatar!, 'avatar', prefs.LowBandwidthMode())}
                        username={props.room.name} />
                </Show>
            </div>
        </div>
    );
}

function RoomHashIcon(props: IRoomIconProps) {
    let subicon = createMemo(() => {
        let flags = props.room.flags;

        // TODO: Rooms with overwrites
        if((flags & 16) == 16) {
            return Icons.TriangleAlert;
        } else if((flags & 64) == 64) {
            return Icons.Lock;
        }
        return;
    });

    return (
        <>
            <VectorIcon id={Icons.Hash} />

            <Show when={subicon()}>
                {icon => (
                    <div class="ln-channel-list__subicon">
                        <VectorIcon id={icon} />
                    </div>
                )}
            </Show>
        </>
    );
}