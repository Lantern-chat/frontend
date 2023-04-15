import { Show } from "solid-js";
import { ShowBool } from "ui/components/flow";

import { Type } from "state/main";
import { Panel } from "state/mutators/window";
import { RootState, useRootDispatch, useRootSelector } from "state/root";
import { activeRoom } from "state/selectors/active";
import { useI18nContext } from "ui/i18n/i18n-solid";

import { SimpleMarkdown } from "ui/components/common/markdown";
import { VectorIcon } from "ui/components/common/icon";

import { Icons } from "lantern-icons";

import "./header.scss";
export function RoomHeader() {
    const { LL } = useI18nContext();

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
    let latest_version = useRootSelector(state => state.window.latest_version);

    let toggle_sidebar = (which: Panel) => {
        dispatch([
            { type: Type.WINDOW_SET_PANEL, panel: show_panel() != Panel.Main ? Panel.Main : which },

            // toggle show_user_list
            which != Panel.RightUserList ? null :
                (dispatch, state: RootState) => state.window.use_mobile_view || dispatch({ type: Type.WINDOW_TOGGLE_USER_LIST, open: !state.window.show_user_list })
        ]);
    };

    return (
        <div class="ln-room-header">
            <div class="ln-room-header__wrapper">
                <div class="ln-room-header__hamburger">
                    <span onClick={() => toggle_sidebar(Panel.LeftRoomList)}>
                        <VectorIcon id={Icons.Menu} />
                    </span>
                </div>

                <div class="ln-room-icon">
                    <VectorIcon id={Icons.Hash} />
                </div>

                <div class="ln-room-info__wrapper">
                    <div class="ln-room-info">
                        <span class="ln-room-info__name ui-text" textContent={room().name} />

                        <Show when={room().topic}>
                            {topic => (
                                <>
                                    <span class="ln-vert">&nbsp;</span>
                                    <span class="ln-room-info__topic ui-text">
                                        <SimpleMarkdown source={topic()} inline />
                                    </span>
                                </>
                            )}
                        </Show>
                    </div>
                </div>

                <div class="ln-room-header__users"
                    title={LL().main.TOGGLE_USERLIST()}
                >
                    <span
                        onClick={() => toggle_sidebar(Panel.RightUserList)}>
                        <VectorIcon id={Icons.Users} />
                    </span>
                </div>

                <ShowBool when={__VERSION__ != latest_version()}>
                    <div class="ln-room-header__version"
                        title={LL().main.RELOAD_PAGE()}
                        onClick={() => (location.reload as any)(true)}>
                        <span>
                            <VectorIcon id={Icons.Refresh} />
                        </span>
                    </div>
                </ShowBool>
            </div>
        </div>
    )
}