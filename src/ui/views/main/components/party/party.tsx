import { batch, createEffect, createRenderEffect, createSignal, Show } from "solid-js";
import { useDispatch, useStructuredSelector } from "solid-mutant";

import { ChannelList } from "./channel_list";
import { MemberList } from "./member_list";
import { PartyHeader } from "./party_header";
import { PartyFooter } from "./party_footer";
import { Channel } from "../channel/channel";
import { HomeSideBar } from "../home/sidebar";

import { Snowflake } from "state/models";
import { RootState, Type } from "state/root";
import { activeParty, activeRoom } from "state/selectors/active";
import { Panel } from "state/mutators/window";

import "./party.scss";
export function Party() {
    let state = useStructuredSelector({
        active_party: activeParty,
        show_panel: (state: RootState) => state.window.show_panel,
        last_panel: (state: RootState) => state.window.last_panel,
        use_mobile_view: (state: RootState) => state.window.use_mobile_view,
    });

    let dispatch = useDispatch();

    let swipe_start = [0, 0];

    let on_touch_start = (e: TouchEvent) => {
        let t = e.changedTouches[0];
        swipe_start = [t.screenX, t.screenY];
    };

    let on_touch_end = (e: TouchEvent) => {
        let t = e.changedTouches[0],
            end_x = t.screenX,
            end_y = t.screenY,
            [start_x, start_y] = swipe_start,
            delta_x = end_x - start_x,
            delta_y = end_y - start_y,
            aspect = Math.abs(delta_x / delta_y);

        if(Math.abs(delta_x) > 40 && aspect > 1.5) {
            if(delta_x > 0) {
                // swiped RIGHT

                switch(state.show_panel) {
                    case Panel.Main: {
                        // swiped right on main, go to channel list
                        dispatch({ type: Type.WINDOW_TOGGLE_ROOM_LIST_SIDEBAR });
                        break;
                    }
                    case Panel.RightUserList: {
                        // swiped right on users, go to main
                        dispatch({ type: Type.WINDOW_TOGGLE_USER_LIST_SIDEBAR });
                        break;
                    }
                }
            } else {
                // swiped LEFT

                switch(state.show_panel) {
                    case Panel.Main: {
                        // swiped left on main, go to users
                        dispatch({ type: Type.WINDOW_TOGGLE_USER_LIST_SIDEBAR });
                        break;
                    }
                    case Panel.LeftRoomList: {
                        // swiped left on channels, go to main
                        dispatch({ type: Type.WINDOW_TOGGLE_ROOM_LIST_SIDEBAR });
                        break;
                    }
                }
            }
        }
    };

    let [showLeft, setShowLeft] = createSignal(true);
    let [showRight, setShowRight] = createSignal(!state.use_mobile_view);

    createRenderEffect(() => batch(() => {
        if(state.use_mobile_view) {
            switch(state.show_panel) {
                case Panel.RightUserList: setShowLeft(false); setShowRight(true); break;
                case Panel.LeftRoomList: setShowRight(false); setShowLeft(true); break;
                case Panel.Main: {
                    setShowLeft(state.last_panel == Panel.LeftRoomList);
                    setShowRight(state.last_panel == Panel.RightUserList);
                }
            }
        } else {
            setShowLeft(true);
            setShowRight(true);
        }
    }));

    return (
        <div className="ln-party"
            onTouchStart={state.use_mobile_view ? on_touch_start : undefined}
            onTouchEnd={state.use_mobile_view ? on_touch_end : undefined}
        >
            <Show when={showLeft()}>
                <div
                    className="ln-party__sidebar"
                    classList={{ "ln-party__sidebar--closed": state.use_mobile_view && state.show_panel == Panel.Main }}
                >
                    <Show
                        when={state.active_party != '@me'}
                        fallback={<HomeSideBar />}
                    >
                        <PartyHeader />
                        <ChannelList />
                    </Show>

                    <PartyFooter />
                </div>
            </Show>

            <div
                className="ln-party__channel"
                classList={{
                    "ln-party__channel--expanded-right": state.use_mobile_view && state.show_panel == Panel.RightUserList,
                    "ln-party__channel--expanded-left": state.use_mobile_view && state.show_panel == Panel.LeftRoomList,
                }}
            >
                {/*NOTE: active_party may be null */}
                <Show when={state.active_party && state.active_party != '@me'} fallback="Test">
                    <Channel />
                </Show>
            </div>

            <Show when={showRight() && state.use_mobile_view}>
                <div
                    className="ln-party__user-list"
                    classList={{ "ln-party__user-list--closed": state.use_mobile_view && state.show_panel == Panel.Main }}
                >
                    <Show when={state.active_party && state.active_party != '@me'} fallback="Something">
                        <MemberList />
                    </Show>
                </div>
            </Show>
        </div>
    );
}