import React, { useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { createStructuredSelector } from "reselect";

import { ChannelList } from "./channel_list";
import { MemberList } from "./member_list";
import { PartyHeader } from "./party_header";
import { PartyFooter } from "./party_footer";
import { Channel } from "../channel/channel";

import { Snowflake } from "state/models";
import { RootState, Type } from "state/root";
import { Panel } from "state/reducers/window";

let party_selector = createStructuredSelector({
    party: (state: RootState) => state.history.parts[1],
    channel: (state: RootState) => state.history.parts[2],
    show_panel: (state: RootState) => state.window.show_panel,
    last_panel: (state: RootState) => state.window.last_panel,
    use_mobile_view: (state: RootState) => state.window.use_mobile_view,
});

import "./party.scss";
export const Party = React.memo(() => {
    let { show_panel, last_panel, party, channel, use_mobile_view } = useSelector(party_selector);
    let dispatch = useDispatch();

    let [swipe_start, setSwipeStart] = useState([0, 0]);

    let classes = ["ln-party__channel"],
        sidebar_classes = ["ln-party__sidebar"],
        left, right,
        on_touch_start, on_touch_end,
        show_left = true; // always visible on Desktop

    if(use_mobile_view) {
        on_touch_start = (e: React.TouchEvent<HTMLDivElement>) => {
            let t = e.changedTouches[0];
            setSwipeStart([t.screenX, t.screenY]);
        };
        on_touch_end = (e: React.TouchEvent<HTMLDivElement>) => {
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
        };

        let user_list_classes = ["ln-party__user-list"],
            sc = sidebar_classes[0],
            ulc = user_list_classes[0],
            show_right = true;

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
            right = (
                <div className={user_list_classes.join(' ')}>
                    <MemberList />
                </div>
            );
        }
    }

    if(show_left) {
        left = (
            <div className={sidebar_classes.join(' ')}>
                <PartyHeader />
                <ChannelList />
                <PartyFooter />
            </div>
        );
    }

    return (
        <div className="ln-party" onTouchStart={on_touch_start} onTouchEnd={on_touch_end}>
            {left}

            <div className={classes.join(' ')}>
                <Channel party={party} channel={channel} />
            </div>

            {right}
        </div>
    );
});