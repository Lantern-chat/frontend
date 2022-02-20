import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from 'reselect';

import { Type } from "state/main";
import { RootState } from "state/root";
import { activeRoom } from "state/selectors/active";

import { VectorIcon } from "ui/components/common/icon";

import { MenuIcon } from "ui/assets/icons";
import { UsersIcon } from "ui/assets/icons";
import { HashIcon } from "ui/assets/icons";

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
                        <VectorIcon src={MenuIcon} />
                    </span>
                </div>

                <div className="ln-channel-icon">
                    <VectorIcon src={HashIcon} />
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
                        <VectorIcon src={UsersIcon} />
                    </span>
                </div>
            </div>
        </div>
    );
});

if(__DEV__) {
    ChannelHeader.displayName = "ChannelHeader";
}