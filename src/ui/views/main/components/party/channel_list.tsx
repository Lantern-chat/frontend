import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector, createStructuredSelector } from "reselect";

import { RootState, Type } from "state/root";
import { Room } from "state/models";
import { Panel } from "state/reducers/window";

import { Bounce } from "ui/components/common/spinners/bounce";
import { Glyphicon } from "ui/components/common/glyphicon";
import { Avatar } from "ui/components/common/avatar";
import { Link } from "ui/components/history";

import Hash from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-740-hash.svg";

let channel_list_selector = createSelector(
    (state: RootState) => state.chat.active_party, // party_id
    (state: RootState) => state.chat.active_room, // room_id
    (state: RootState) => state.party.parties,
    (party_id, room_id, parties) => {
        let party = party_id ? parties.get(party_id) : null;

        return {
            selected: room_id,
            rooms: party?.rooms,
        };
    }
);

import "./channel_list.scss";
export const ChannelList = React.memo(() => {
    let { selected, rooms = [] } = useSelector(channel_list_selector);
    let show_panel = useSelector((state: RootState) => state.window.show_panel);
    let dispatch = useDispatch();

    // if on the room list, toggle out of that on selection of a room.
    let on_navigate: undefined | (() => void);
    if(show_panel == Panel.LeftRoomList) {
        on_navigate = () => { dispatch({ type: Type.WINDOW_TOGGLE_ROOM_LIST_SIDEBAR }); };
    }

    let inner = rooms.length == 0 ?
        <div style={{ height: "100%", paddingTop: '1em' }}>
            <Bounce size="auto" />
        </div> :
        rooms.map(room =>
            <li key={room.id} className={room.id == selected ? 'selected' : undefined}>
                <Link className="ln-channel-list__channel" href={`/channels/${room.party_id || '@me'}/${room.id}`} onNavigate={on_navigate}>
                    <div className="ln-channel-list__icon">
                        {room.icon_id ?
                            <Avatar url={`/avatars/${room.id}/${room.icon_id}`} username={room.name} /> :
                            <Glyphicon src={Hash} />}
                    </div>
                    <div className="ln-channel-list__name"><span>{room.name}</span></div>
                </Link>
            </li>
        );

    return (
        <ul className="ln-channel-list ln-scroll-y ln-scroll-fixed">
            {inner}
        </ul>
    );
});