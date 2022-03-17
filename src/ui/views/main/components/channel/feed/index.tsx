import { createEffect, createMemo, createRenderEffect, createSignal, For, JSX, Show, useContext } from "solid-js";
import { Dynamic } from "solid-js/web";
import { useDispatch, useSelector, useStructuredSelector } from "solid-mutant";
import { activeParty, activeRoom } from "state/selectors/active";

import dayjs from "lib/time";
import { user_avatar_url } from "config/urls";
import { pickColorFromHash } from "lib/palette";

import { MessageFlags, Room, Snowflake, User, UserPreferenceFlags, user_is_bot, user_is_system } from "state/models";
import { RootState, Type, useRootSelector } from "state/root";
import { loadMessages, SearchMode } from "state/commands";
import { IMessageState, IRoomState } from "state/mutators/chat";
import { Panel } from "state/mutators/window";
import { selectPrefsFlag } from "state/selectors/prefs";

import { createController } from "ui/hooks/createController";
import { AnchoredModal } from "ui/components/modal/anchored";
import { PositionedModal } from "ui/components/modal/positioned";
import { createSimplePositionedContextMenu, createSimpleToggleOnClick } from "ui/hooks/useMain";

import { MsgContextMenu } from "../../menus/msg_context";
import { Branch } from "ui/components/flow";
import { VectorIcon } from "ui/components/common/icon";
import { Message as MessageBody } from "../message/msg";

import { Anchor, InfiniteScroll, InfiniteScrollContext, InfiniteScrollController } from "ui/components/infinite_scroll";

import { ArrowThinRightIcon, BalloonIcon, ChevronDownIcon, PencilIcon, PushPinIcon } from "lantern-icons";

type PartialRoomState = Pick<IRoomState, 'room' | 'fully_loaded' | 'msgs'>;

import "./feed.scss";
export function MessageFeed() {
    let state = useStructuredSelector({
        use_mobile_view: (state: RootState) => state.window.use_mobile_view,
        show_panel: (state: RootState) => state.window.show_panel,
        compact: selectPrefsFlag(UserPreferenceFlags.CompactView),
        gl: selectPrefsFlag(UserPreferenceFlags.GroupLines),
        room: (state: RootState) => {
            let active_room = activeRoom(state);
            if(active_room) {
                let room_state = state.chat.rooms[active_room];
                if(room_state) {
                    return {
                        room: room_state.room,
                        fully_loaded: room_state.fully_loaded,
                        msgs: room_state.msgs,
                    }
                }
            }
            return;
        }
    });

    let dispatch = useDispatch();

    let on_cover_click = (e: MouseEvent) => {
        switch(state.show_panel) {
            case Panel.LeftRoomList: dispatch({ type: Type.WINDOW_TOGGLE_ROOM_LIST_SIDEBAR }); break;
            case Panel.RightUserList: dispatch({ type: Type.WINDOW_TOGGLE_USER_LIST_SIDEBAR }); break;
        }
    };

    let [ifs, setIFS] = createController<InfiniteScrollController>();

    let on_goto_click = () => {
        ifs()?.gotoStartSmooth();
    };

    return (
        <div className="ln-msg-list__flex-container">
            <Show when={state.use_mobile_view && state.show_panel != Panel.Main}>
                <div className="ln-msg-list__cover" onClick={on_cover_click} />
            </Show>

            <InfiniteScroll start={Anchor.Bottom} setController={setIFS} wrapperClassList={{
                'has-timeline': !state.use_mobile_view,
                'compact': state.compact,
                'group-lines': state.gl,
            }}>
                <InfiniteScrollContext.Provider value={ifs}>
                    <ul className="ln-msg-list" id="ln-msg-list" >
                        <Show when={state.room?.fully_loaded}>
                            <li className="ln-msg__top">
                                <div className="ui-text">
                                    <VectorIcon src={BalloonIcon} /> You have reached the top of #{state.room!.room.name}! <VectorIcon src={BalloonIcon} />
                                    <br />
                                    Congrats on making it this far.
                                </div>
                            </li>
                        </Show>

                        <For each={state.room?.msgs}>
                            {msg => <Message msg={msg} />}
                        </For>
                    </ul>
                </InfiniteScrollContext.Provider>
            </InfiniteScroll>

            <Show when={false}>
                <div className="ln-feed-footers" classList={{ 'has-timeline': !state.use_mobile_view }}>
                    <GotoBottomFooter onClick={on_goto_click} use_mobile_view={state.use_mobile_view} />
                </div>
            </Show>
        </div>
    );
}

interface IGotoBottomFooterProps {
    onClick(): void,
    use_mobile_view: boolean,
}

function GotoBottomFooter(props: IGotoBottomFooterProps) {
    return (
        <Branch>
            <Branch.If when={props.use_mobile_view}>
                <span id="goto-now" onClick={() => props.onClick()}>
                    <VectorIcon src={ChevronDownIcon} />
                </span>
            </Branch.If>

            <Branch.Else>
                <div className="ln-feed-footer ui-text" onClick={() => props.onClick()}>
                    <span>You're viewing older messages</span>
                    <span id="goto-now">
                        Go to now <VectorIcon src={ChevronDownIcon} />
                    </span>
                </div>
            </Branch.Else>
        </Branch>
    );
}

import { CompactMessage } from "../message/compact";
import { CozyMessage } from "../message/cozy";
import { SystemMessage } from "../message/system";

function Message(props: { msg: DeepReadonly<IMessageState> }) {
    let state = useStructuredSelector({
        is_light_theme: selectPrefsFlag(UserPreferenceFlags.LightMode),
        compact: selectPrefsFlag(UserPreferenceFlags.CompactView),
    });

    let [warn, setWarn] = createSignal(false),
        [pos, main_click_props] = createSimplePositionedContextMenu({
            onMainClick: () => setWarn(false),
        });

    // select inner message component based on style.
    // The identifier must be Proper-case to be used as a Component below.
    let Inner = createMemo(() => {
        if(user_is_system(props.msg.msg.author)) {
            return SystemMessage;
        } else {
            return state.compact ? CompactMessage : CozyMessage;
        }
    });

    return (
        <div
            id={props.msg.msg.id}
            className="ln-msg__outer"
            classList={{
                "highlighted": !!pos(),
                "warning": !!pos() && warn(),
            }}
            {...main_click_props}
        >
            <div className="ln-msg__wrapper">
                <Dynamic component={Inner()} {...props} is_light_theme={state.is_light_theme} compact={state.compact} />

                <Show when={pos()}>
                    <PositionedModal {...pos()!}>
                        <MsgContextMenu msg={props.msg} pos={pos()} onConfirmChange={(pending: boolean) => setWarn(pending)} />
                    </PositionedModal>
                </Show>
            </div>
        </div>
    );
}


