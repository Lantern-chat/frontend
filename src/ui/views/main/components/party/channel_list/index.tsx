import { createSelector, For, Show } from "solid-js";

import { copyText } from "lib/clipboard";

import { useI18nContext } from "ui/i18n/i18n-solid";
import { Type, useRootDispatch, useRootSelector } from "state/root";
import { activeParty, activeRoom } from "state/selectors/active";
import { Room, Snowflake } from "state/models";
import { usePrefs } from "state/contexts/prefs";
import { Panel } from "state/mutators/window";

import { UIText } from "ui/components/common/ui-text";
import { Bounce } from "ui/components/common/spinners/bounce";
import { VectorIcon } from "ui/components/common/icon";
import { Avatar } from "ui/components/common/avatar";
import { Link } from "ui/components/history";
import { createSimplePositionedContextMenu } from "ui/hooks/useMain";

import { PositionedModal } from "ui/components/modal/positioned";
import { ContextMenu } from "../../menus/list";
import { RoomIcon } from "./room_icon";

import "./channel_list.scss";
export function ChannelList() {
    let dispatch = useRootDispatch();

    let selected = useRootSelector(activeRoom);

    let state = useRootSelector(state => {
        let party_id = activeParty(state);

        let res = { party_id } as {
            party_id: Snowflake | undefined,
            rooms?: DeepReadonly<Array<Room>>,
        };

        if(party_id) {
            res.rooms = state.party.parties[party_id]?.rooms;
        }

        return res;
    });

    let show_panel = useRootSelector(state => state.window.show_panel);

    let on_navigate = () => {
        // if on the room list, go to main to display channel.
        if(show_panel() == Panel.LeftRoomList) {
            dispatch({ type: Type.WINDOW_SET_PANEL, panel: Panel.Main });
        }
    };

    let [pos, main_click_props] = createSimplePositionedContextMenu();

    let is_room_selected = createSelector(selected);

    return (
        <ul class="ln-channel-list ln-scroll-y ln-scroll-fixed" {...main_click_props} >
            <Show when={state().rooms?.length} fallback={<div style={{ height: "100%", paddingTop: '1em' }}><Bounce size="auto" /></div>}>
                <For each={state().rooms}>
                    {room => <ListedChannel room={room} selected={is_room_selected(room.id)} onNavigate={on_navigate} />}
                </For>
            </Show>

            <Show when={!!state().party_id && pos()}>
                {pos => (
                    <PositionedModal rect={pos}>
                        <RoomListContextMenu party_id={state().party_id!} />
                    </PositionedModal>
                )}
            </Show>
        </ul>
    );
}

interface IListedChannelProps {
    room: DeepReadonly<Room>,
    selected: boolean,
    onNavigate?: () => void,
}

function ListedChannel(props: IListedChannelProps) {
    let [pos, main_click_props] = createSimplePositionedContextMenu();

    return (
        <li classList={{ 'selected': props.selected }} {...main_click_props}>
            <Link
                class="ln-channel-list__channel"
                href={`/channels/${props.room.party_id || '@me'}/${props.room.id}`}
                onNavigate={props.onNavigate}
                noAction={props.selected}
            >
                <RoomIcon room={props.room} />

                <div class="ln-channel-list__name">
                    <UIText text={props.room.name} />
                </div>
            </Link>

            <Show when={pos()}>
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
    room: DeepReadonly<Room>,
}

function RoomContextMenu(props: IRoomContextMenuProps) {
    let dev_mode = usePrefs().DeveloperMode;;

    let { LL } = useI18nContext();

    return (
        <ContextMenu dark>
            <div>
                <UIText text={LL().main.menus.MARK_AS_READ()} />
            </div>

            <hr />

            <div>
                <UIText text={LL().main.menus.room.EDIT()} />
            </div>

            <Show when={dev_mode()}>
                <hr />

                <div onClick={() => copyText(props.room.id)}>
                    <UIText text={LL().main.menus.COPY_ID()} />
                </div>
            </Show>
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
                <UIText text={LL().main.menus.room_list.CREATE()} />
            </div>
        </ContextMenu>
    );
}
