import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { useDispatch, useSelector, useStructuredSelector } from "solid-mutant";
import { activeParty, activeRoom } from "state/selectors/active";

import { useI18nContext } from "ui/i18n/i18n-solid";

import dayjs from "lib/time";
import { user_avatar_url } from "config/urls";
import { pickColorFromHash } from "lib/palette";

import { MessageFlags, Room, Snowflake, User, UserPreferenceFlags, user_is_bot, user_is_system } from "state/models";
import { RootState, Type, useRootSelector } from "state/root";
import { loadMessages, SearchMode } from "state/commands";
import { IMessageState, IRoomState } from "state/mutators/chat";
import { selectPrefsFlag } from "state/selectors/prefs";

import { createController } from "ui/hooks/createController";
import { AnchoredModal } from "ui/components/modal/anchored";
import { PositionedModal } from "ui/components/modal/positioned";
import { createSimplePositionedContextMenu, createSimpleToggleOnClick, Hotkey, useMainHotkeys } from "ui/hooks/useMain";

import { Timeline } from "./timeline";
import { MsgContextMenu } from "../../menus/msg_context";
import { Branch } from "ui/components/flow";
import { VectorIcon } from "ui/components/common/icon";

import { Anchor, InfiniteScroll, InfiniteScrollContext, InfiniteScrollController } from "ui/components/infinite_scroll";

import { BalloonIcon, ChevronDownIcon } from "lantern-icons";

function compute_goto(ifs: InfiniteScrollController | null): boolean {
    if(ifs) {
        let container = ifs.container;
        if(container) {
            let clientHeight = container.clientHeight,
                scrollHeight = container.scrollHeight - container.offsetHeight;

            return ifs.pos < (scrollHeight - clientHeight * 5);
        }
    }

    return false;
}

import "./feed.scss";
export function MessageFeed() {
    let state = useStructuredSelector({
        use_mobile_view: (state: RootState) => state.window.use_mobile_view,
        compact: selectPrefsFlag(UserPreferenceFlags.CompactView),
        gl: selectPrefsFlag(UserPreferenceFlags.GroupLines),
        active_room: activeRoom,
        room: (state: RootState) => {
            let active_room = activeRoom(state);
            if(active_room) {
                let room_state = state.chat.rooms[active_room];
                if(room_state) {
                    return {
                        room: room_state.room,
                        fully_loaded: room_state.fully_loaded,
                        msgs: room_state.msgs,
                        is_loading: room_state.is_loading
                    }
                }
            }
            return;
        }
    });

    let dispatch = useDispatch();

    let [ifs, setIFS] = createController<InfiniteScrollController>();
    // on room change, go to start of ifs
    createEffect(() => { state.active_room, ifs()?.gotoStart() });

    useMainHotkeys([Hotkey.FeedArrowDown, Hotkey.FeedArrowUp, Hotkey.FeedPageDown, Hotkey.FeedPageUp, Hotkey.FeedEnd], (hotkey) => {
        let i = ifs();
        if(i) switch(hotkey) {
            case Hotkey.FeedArrowDown: i.scrollArrowDown(); break;
            case Hotkey.FeedArrowUp: i.scrollArrowUp(); break;
            case Hotkey.FeedPageDown: i.scrollPageDown(); break;
            case Hotkey.FeedPageUp: i.scrollPageUp(); break;
            case Hotkey.FeedEnd: i.gotoStart(); break;
        }
    });

    let on_goto_click = () => ifs()?.gotoStartSmooth();
    let [goto, setGoto] = createSignal(false);
    let on_scroll = () => setGoto(compute_goto(ifs()));
    createEffect(() => setGoto(compute_goto(ifs())));
    createEffect(() => dispatch({ type: Type.TOGGLE_FOOTERS, show: goto() }));

    return (
        <div className="ln-msg-list__flex-container">
            <Show when={!state.use_mobile_view}>
                <Timeline direction={0} position={0} />
            </Show>

            <Show when={__DEV__ && state.room?.is_loading}>
                Room is Loading
            </Show>

            <InfiniteScroll
                start={Anchor.Bottom}
                setController={setIFS}
                onScroll={on_scroll}
                containerClassList={{
                    'has-timeline': !state.use_mobile_view,
                    'compact': state.compact,
                    'group-lines': state.gl,
                }}
            >
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

            <div className="ln-feed-footers" classList={{ 'has-timeline': !state.use_mobile_view }}>
                <Show when={goto()}>
                    <GotoBottomFooter onClick={on_goto_click} use_mobile_view={state.use_mobile_view} />
                </Show>
            </div>
        </div>
    );
}

interface IGotoBottomFooterProps {
    onClick(): void,
    use_mobile_view: boolean,
}

function GotoBottomFooter(props: IGotoBottomFooterProps) {
    let { LL } = useI18nContext();

    return (
        <Branch>
            <Branch.If when={props.use_mobile_view}>
                <span id="goto-now" onClick={() => props.onClick()}>
                    <VectorIcon src={ChevronDownIcon} />
                </span>
            </Branch.If>

            <Branch.Else>
                <div className="ln-feed-footer ui-text" onClick={() => props.onClick()}>
                    <span textContent={LL().main.VIEWING_OLDER()} />
                    <span id="goto-now">
                        {LL().main.GOTO_NOW()} <VectorIcon src={ChevronDownIcon} />
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
        gl: selectPrefsFlag(UserPreferenceFlags.GroupLines),
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
        <>
            <Show when={props.msg.sg && state.gl}>
                <hr />
            </Show>

            <li
                id={props.msg.msg.id}
                className="ln-msg__outer"
                classList={{
                    "highlighted": !!pos(),
                    "warning": !!pos() && warn(),
                    "sg": props.msg.sg,
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
            </li>
        </>
    );
}


