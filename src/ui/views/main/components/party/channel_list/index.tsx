import { createMemo, createSelector, For, Show } from "solid-js";

import { copyText } from "lib/clipboard";

import { createShallowMemo } from "ui/hooks/createShallowMemo";
import { useI18nContext } from "ui/i18n/i18n-solid";
import { Type, useRootStore } from "state/root";
import { activeParty, activeRoom } from "state/selectors/active";
import { Room, Snowflake } from "state/models";
import { usePrefs } from "state/contexts/prefs";
import { Panel } from "state/mutators/window";

import { UserText } from "ui/components/common/ui-text-user";
import { Bounce } from "ui/components/common/spinners/bounce";
import { Link } from "ui/components/history";
import { createSimplePositionedContextMenu } from "ui/hooks/useMain";

import { PositionedModal } from "ui/components/modal/positioned";
import { ContextMenu } from "../../menus/list";
import { RoomIcon } from "./room_icon";

import "./channel_list.scss";
export function ChannelList() {
    let { dispatch, state } = useRootStore();

    let party = createMemo(() => {
        let party_id = activeParty(state);

        let res = { party_id } as {
            party_id: Snowflake | undefined,
            rooms?: Record<Snowflake, Room>,
        };

        if(party_id) {
            res.rooms = state.party.parties[party_id]?.rooms;
        }

        return res;
    });

    let on_navigate = () => {
        // if on the room list, go to main to display channel.
        if(state.window.show_panel == Panel.LeftRoomList) {
            dispatch({ type: Type.WINDOW_SET_PANEL, panel: Panel.Main });
        }
    };

    let [pos, main_click_props] = createSimplePositionedContextMenu();

    let rooms = createShallowMemo(() => Object.values(party().rooms || {}).sort((a, b) => a.position - b.position), 'array');

    let is_room_selected = createSelector(() => activeRoom(state));

    return (
        <ul class="ln-channel-list ln-scroll-y ln-scroll-fixed" {...main_click_props} >
            <Show when={rooms()?.length} fallback={<div style={{ height: "100%", 'padding-top': '1em' }}><Bounce size="auto" /></div>}>
                <For each={rooms()}>
                    {room => <ListedChannel room={room} selected={is_room_selected(room.id)} onNavigate={on_navigate} />}
                </For>
            </Show>

            <Show keyed when={!!party().party_id && pos()}>
                {pos => (
                    <PositionedModal rect={pos}>
                        <RoomListContextMenu party_id={party().party_id!} />
                    </PositionedModal>
                )}
            </Show>
        </ul>
    );
}

interface IListedChannelProps {
    room: Room,
    selected: boolean,
    onNavigate?: () => void,
}

function ListedChannel(props: IListedChannelProps) {
    let [pos, main_click_props] = createSimplePositionedContextMenu();

    return (
        <li classList={{ 'selected': props.selected }} {...main_click_props}
            data-room-name={props.room.name}
            data-roomid={props.room.id}
        >
            <Link
                class="ln-channel-list__channel"
                href={`/channels/${props.room.party_id || '@me'}/${props.room.id}`}
                onNavigate={props.onNavigate}
                noAction={props.selected}
            >
                <RoomIcon room={props.room} />

                <div class="ln-channel-list__name">
                    <UserText class="ui-text" text={props.room.name} />
                </div>
            </Link>

            <Show keyed when={pos()}>
                {pos => (
                    <PositionedModal rect={pos}>
                        <RoomContextMenu room={props.room} />
                    </PositionedModal>
                )}
            </Show>
        </li>
    );
}

export interface IRoomContextMenuProps {
    room: Room,
}

function RoomContextMenu(props: IRoomContextMenuProps) {
    let dev_mode = usePrefs().DeveloperMode;;

    let { LL } = useI18nContext();

    return (
        <ContextMenu dark>
            <div>
                <span class="ui-text" textContent={LL().main.menus.MARK_AS_READ()} />
            </div>

            <hr />

            <div>
                <span class="ui-text" textContent={LL().main.menus.room.EDIT()} />
            </div>

            {() => dev_mode() && (
                <>
                    <hr />

                    <div onClick={() => copyText(props.room.id)}>
                        <span class="ui-text" textContent={LL().main.menus.COPY_ID()} />
                    </div>
                </>
            )}
        </ContextMenu>
    );
}

export interface IRoomListContextMenuProps {
    party_id: Snowflake,
}

function RoomListContextMenu(props: IRoomListContextMenuProps) {
    let { LL } = useI18nContext();

    return (
        <ContextMenu dark>
            <div>
                <span class="ui-text" textContent={LL().main.menus.room_list.CREATE()} />
            </div>
        </ContextMenu>
    );
}
