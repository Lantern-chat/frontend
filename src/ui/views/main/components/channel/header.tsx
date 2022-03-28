import { Show } from "solid-js";
import { useDispatch } from "solid-mutant";

import { Type } from "state/main";
import { useRootSelector } from "state/root";
import { activeRoom } from "state/selectors/active";

import { VectorIcon } from "ui/components/common/icon";

import { MenuIcon } from "lantern-icons";
import { UsersIcon } from "lantern-icons";
import { HashIcon } from "lantern-icons";

import "./header.scss";
export function ChannelHeader() {
    let dispatch = useDispatch();
    let room = useRootSelector(state => {
        let active_room = activeRoom(state), room;
        if(active_room) {
            room = state.chat.rooms[active_room]?.room;
        }
        return room || {
            name: "Loading...",
            topic: "Loading...",
        };
    });

    return (
        <div className="ln-channel-header">
            <div className="ln-channel-header__wrapper">
                <div className="ln-channel-header__hamburger">
                    <span onClick={() => dispatch({ type: Type.WINDOW_TOGGLE_ROOM_LIST_SIDEBAR })}>
                        <VectorIcon src={MenuIcon} />
                    </span>
                </div>

                <div className="ln-channel-icon">
                    <VectorIcon src={HashIcon} />
                </div>

                <div className="ln-channel-info__wrapper">
                    <div className="ln-channel-info">
                        <span className="ln-channel-info__name ui-text" textContent={room().name} />

                        <Show when={room().topic}>
                            <span className="ln-vert">&nbsp;</span>
                            <span className="ln-channel-info__topic ui-text" textContent={room().topic} />
                        </Show>
                    </div>
                </div>

                <div className="ln-channel-header__users">
                    <span
                        onClick={() => dispatch({ type: Type.WINDOW_TOGGLE_USER_LIST_SIDEBAR })}>
                        <VectorIcon src={UsersIcon} />
                    </span>
                </div>
            </div>
        </div>
    )
}