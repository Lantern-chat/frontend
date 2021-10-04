import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from 'reselect';

import { Type } from "state/main";
import { RootState } from "state/root";
import { activeRoom } from "state/selectors/active";

import { Glyphicon } from "ui/components/common/glyphicon";

import Menu from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-600-menu.svg";
import Users from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-321-users.svg";
import Hash from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-740-hash.svg";

const header_selector = createSelector(
    activeRoom,
    (state: RootState) => state.chat.rooms,
    (active_room, rooms) => {
        return active_room && rooms.get(active_room);
    }
);

import "./header.scss";
export const ChannelHeader = React.memo(() => {
    let dispatch = useDispatch();
    let room = useSelector(header_selector);

    if(!room) return null;

    let topic;
    if(room.room.topic) {
        topic = (
            <>
                <span className="ln-vert">&nbsp;</span>
                <span className="ln-channel-info__topic ui-text">{room.room.topic}</span>
            </>
        );
    }

    return (
        <div className="ln-channel-header">
            <div className="ln-channel-header__wrapper">
                <div className="ln-channel-header__hamburger">
                    <span onClick={() => dispatch({ type: Type.WINDOW_TOGGLE_ROOM_LIST_SIDEBAR })}>
                        <Glyphicon src={Menu} />
                    </span>
                </div>

                <div className="ln-channel-icon">
                    <Glyphicon src={Hash} />
                </div>

                <div className="ln-channel-info__wrapper">
                    <div className="ln-channel-info">
                        <span className="ln-channel-info__name ui-text">{room.room.name}</span>
                        {topic}
                    </div>
                </div>

                <div className="ln-channel-header__users">
                    <span
                        onClick={() => dispatch({ type: Type.WINDOW_TOGGLE_USER_LIST_SIDEBAR })}>
                        <Glyphicon src={Users} />
                    </span>
                </div>
            </div>
        </div>
    );
});