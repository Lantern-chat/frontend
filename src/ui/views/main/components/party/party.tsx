import React, { useCallback, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { createStructuredSelector } from "reselect";

import { ChannelList } from "./channel_list";
import { MemberList } from "./member_list";
import { PartyHeader } from "./party_header";
import { PartyFooter } from "./party_footer";
import { Channel } from "../channel/channel";
import { HomeSideBar } from "../home/sidebar";

import { Snowflake } from "state/models";
import { RootState, Type } from "state/root";
import { activeParty, activeRoom } from "state/selectors/active";
import { Panel } from "state/reducers/window";

let party_selector = createStructuredSelector({
    active_party: activeParty,
    active_room: activeRoom,
    show_panel: (state: RootState) => state.window.show_panel,
    last_panel: (state: RootState) => state.window.last_panel,
    use_mobile_view: (state: RootState) => state.window.use_mobile_view,
});

import "./party.scss";
export const Party = React.memo(() => {
    let { show_panel, last_panel, active_party, active_room, use_mobile_view } = useSelector(party_selector);
    let dispatch = useDispatch();

    let [swipe_start, setSwipeStart] = useState([0, 0]);

    let classes = ["ln-party__channel"],
        sidebar_classes = ["ln-party__sidebar"],
        left, right,
        show_left = true, // always visible on Desktop
        on_touch_start = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
            let t = e.changedTouches[0];
            setSwipeStart([t.screenX, t.screenY]);
        }, []),
        on_touch_end = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
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

                    switch(show_panel) {
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

                    switch(show_panel) {
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
        }, [show_panel, swipe_start]);

    if(use_mobile_view) {
        let user_list_classes = ["ln-party__user-list"],
            sc = sidebar_classes[0],
            ulc = user_list_classes[0],
            show_right = true;

        // handle switching between open panels on mobile
        // Panels default to "show", so
        switch(show_panel) {
            case Panel.RightUserList: {
                classes.push(classes[0] + '--expanded-right');
                show_left = false;
                break;
            }
            case Panel.LeftRoomList: {
                classes.push(classes[0] + '--expanded-left');
                show_right = false;
                break;
            }
            case Panel.Main:
            default: {
                show_left = last_panel == Panel.LeftRoomList;
                show_right = last_panel == Panel.RightUserList;

                sidebar_classes.push(sc + '--closed');
                user_list_classes.push(ulc + '--closed');
            }
        }

        if(show_right) {
            if(active_party === '@me') {
                right = (
                    <div>Something</div>
                )
            } else {

                right = <MemberList />;
            }

            right = (
                <div className={user_list_classes.join(' ')}>{right}</div>
            )
        }
    }

    if(show_left) {
        if(active_party == '@me') {
            left = (
                <>
                    <HomeSideBar />
                </>
            );
        } else {
            left = (
                <>
                    <PartyHeader />
                    <ChannelList />

                </>
            );
        }

        left = (
            <div className={sidebar_classes.join(' ')}>
                {left}
                <PartyFooter />
            </div>
        )
    }

    let center;
    if(active_party == '@me') {
        center = "Test"
    } else {
        center = <Channel channel={active_room} />;
    }

    return (
        <div className="ln-party"
            onTouchStart={use_mobile_view ? on_touch_start : undefined}
            onTouchEnd={use_mobile_view ? on_touch_end : undefined}
        >
            {left}

            <div className={classes.join(' ')}>
                {center}
            </div>

            {right}
        </div>
    );
});