import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector, createStructuredSelector } from "reselect";

import { copyText } from "lib/clipboard";

import { RootState, Type } from "state/root";
import { activeParty, activeRoom } from "state/selectors/active";
import { selectPrefsFlag } from "state/selectors/prefs";
import { Room, Snowflake, UserPreferenceFlags } from "state/models";
import { Panel } from "state/reducers/window";
import { room_avatar_url } from "config/urls";

import { Bounce } from "ui/components/common/spinners/bounce";
import { Glyphicon } from "ui/components/common/glyphicon";
import { Avatar } from "ui/components/common/avatar";
import { Link } from "ui/components/history";
import { useSimplePositionedContextMenu } from "ui/hooks/useMainClick";

import { PositionedModal } from "ui/components/modal/positioned_modal";
import { ContextMenu } from "../menus/list";

import Hash from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-740-hash.svg";

let channel_list_selector = createSelector(
    activeParty, // party_id
    activeRoom, // room_id
    (state: RootState) => state.party.parties,
    (party_id, room_id, parties) => {
        let party = party_id ? parties.get(party_id) : null;

        return {
            party_id,
            selected: room_id,
            rooms: party?.rooms,
        };
    }
);

import "./channel_list.scss";
export const ChannelList = React.memo(() => {
    let { party_id, selected, rooms = [] } = useSelector(channel_list_selector);
    let show_panel = useSelector((state: RootState) => state.window.show_panel);

    let dispatch = useDispatch();

    // if on the room list, toggle out of that on selection of a room.
    let on_navigate: undefined | (() => void);
    if(show_panel == Panel.LeftRoomList) {
        on_navigate = () => { dispatch({ type: Type.WINDOW_TOGGLE_ROOM_LIST_SIDEBAR }); };
    }

    let inner;
    if(rooms.length == 0) {
        inner = (
            <div style={{ height: "100%", paddingTop: '1em' }}>
                <Bounce size="auto" />
            </div>
        );
    } else {
        inner = rooms.map(room => <ListedChannel key={room.id} room={room} selected={selected == room.id} onNavigate={on_navigate} />);
    }

    let menu, [pos, main_click_props] = useSimplePositionedContextMenu();

    if(pos && party_id) {
        menu = (
            <PositionedModal {...pos}>
                <RoomListContextMenu party_id={party_id} />
            </PositionedModal>
        );
    }

    return (
        <ul className="ln-channel-list ln-scroll-y ln-scroll-fixed" {...main_click_props} >
            {inner}
            {menu}
        </ul>
    );
});

interface IListedChannelProps {
    room: Room,
    selected: boolean,
    onNavigate?: () => void,
}

const ListedChannel = React.memo(({ room, selected, onNavigate }: IListedChannelProps) => {
    let menu, [pos, main_click_props] = useSimplePositionedContextMenu();

    if(pos) {
        menu = (
            <PositionedModal {...pos}>
                <RoomContextMenu room={room} />
            </PositionedModal>
        );
    }

    return (
        <li className={selected ? 'selected' : undefined} {...main_click_props}>
            <Link className="ln-channel-list__channel" href={`/channels/${room.party_id || '@me'}/${room.id}`}
                onNavigate={onNavigate} noAction={selected}>
                <div className="ln-channel-list__icon">
                    {room.avatar ?
                        <Avatar url={room_avatar_url(room.id, room.avatar)} username={room.name} /> :
                        <Glyphicon src={Hash} />}
                </div>
                <div className="ln-channel-list__name">
                    <span className="ui-text">{room.name}</span>
                </div>
            </Link>

            {menu}
        </li>
    );
});

export interface IRoomContextMenuProps {
    room: Room,
}

const RoomContextMenu = React.memo((props: IRoomContextMenuProps) => {
    let dev_mode = useSelector(selectPrefsFlag(UserPreferenceFlags.DeveloperMode));

    return (
        <ContextMenu dark>
            <div>
                <span className="ui-text">Mark as Read</span>
            </div>

            <hr />

            <div>
                <span className="ui-text">Edit Channel</span>
            </div>

            {
                dev_mode && (
                    <>
                        <hr />
                        <div onClick={() => copyText(props.room.id)}>
                            <span className="ui-text">Copy ID</span>
                        </div>
                    </>
                )
            }


        </ContextMenu>
    );
});

export interface IRoomListContextMenuProps {
    party_id: Snowflake,
}

const RoomListContextMenu = React.memo((props: IRoomListContextMenuProps) => {
    return (
        <ContextMenu dark>
            <div>
                <span className="ui-text">Create Channel</span>
            </div>
        </ContextMenu>
    );
});