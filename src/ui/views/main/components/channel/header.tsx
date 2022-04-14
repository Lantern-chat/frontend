import { Show } from "solid-js";

import { Type } from "state/main";
import { Panel } from "state/mutators/window";
import { ReadRootState, useRootDispatch, useRootSelector } from "state/root";
import { activeRoom } from "state/selectors/active";

import { VectorIcon } from "ui/components/common/icon";

import { Icons } from "lantern-icons";

import "./header.scss";
export function ChannelHeader() {
    let dispatch = useRootDispatch();
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

    let show_panel = useRootSelector(state => state.window.show_panel);

    let toggle_sidebar = (which: Panel) => {
        dispatch([
            { type: Type.WINDOW_SET_PANEL, panel: show_panel() != Panel.Main ? Panel.Main : which },

            // toggle show_user_list
            which != Panel.RightUserList ? null :
                (dispatch, state: ReadRootState) => state.window.use_mobile_view || dispatch({ type: Type.WINDOW_TOGGLE_USER_LIST, open: !state.window.show_user_list })
        ]);
    };

    return (
        <div className="ln-channel-header">
            <div className="ln-channel-header__wrapper">
                <div className="ln-channel-header__hamburger">
                    <span onClick={() => toggle_sidebar(Panel.LeftRoomList)}>
                        <VectorIcon id={Icons.Menu} />
                    </span>
                </div>

                <div className="ln-channel-icon">
                    <VectorIcon id={Icons.Hash} />
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
                        onClick={() => toggle_sidebar(Panel.RightUserList)}>
                        <VectorIcon id={Icons.Users} />
                    </span>
                </div>
            </div>
        </div>
    )
}