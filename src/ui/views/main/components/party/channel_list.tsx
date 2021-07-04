import React from "react";
import { useSelector } from "react-redux";
import { createSelector, createStructuredSelector } from "reselect";

import { Bounce } from "ui/components/common/spinners/bounce";
import { Glyphicon } from "ui/components/common/glyphicon";
import { Avatar } from "ui/components/common/avatar";
import { Link } from "ui/components/history";

import Hash from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-740-hash.svg";

import { RootState } from "state/root";
import { Room } from "state/models";


const ListedChannel = React.memo(({ room }: { room: Room }) => {
    return (
        <Link className="ln-channel-list__channel" href={`/channels/${room.party_id || '@me'}/${room.id}`}>
            <div className="ln-channel-list__icon">
                {room.icon_id ?
                    <Avatar url={`/avatars/${room.id}/${room.icon_id}`} username={room.name} /> :
                    <Glyphicon src={Hash} />}
            </div>
            <div className="ln-channel-list__name"><span>{room.name}</span></div>
        </Link>
    );
});


let channel_list_selector = createSelector(
    (state: RootState) => state.history.parts[1], // party_id
    (state: RootState) => state.history.parts[2], // room_id
    (state: RootState) => state.party.parties,
    (party_id, room_id, parties) => {
        let party = parties.get(party_id);

        return {
            selected: room_id,
            rooms: party?.rooms,
        };
    }
);

import "./channel_list.scss";
export const ChannelList = React.memo(() => {
    let { selected, rooms = [] } = useSelector(channel_list_selector);

    let inner = rooms.length == 0 ?
        <div style={{ height: "100%", paddingTop: '1em' }}>
            <Bounce size="auto" />
        </div> :
        rooms.map(room =>
            <li key={room.id} className={room.id == selected ? 'selected' : undefined}>
                <ListedChannel room={room} />
            </li>
        );

    return (
        <ul className="ln-channel-list ln-scroll-y ln-scroll-fixed">
            {inner}
        </ul>
    );
});