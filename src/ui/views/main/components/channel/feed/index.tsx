import { createEffect, createMemo, createSignal, For, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { useStructuredSelector } from "solid-mutant";
import { activeParty, activeRoom } from "state/selectors/active";

import { useI18nContext } from "ui/i18n/i18n-solid";

import { MessageFlags, Room, Snowflake, User, UserPreferenceFlags, user_is_bot, user_is_system } from "state/models";
import { RootState, Type, useRootDispatch, useRootSelector } from "state/root";
import { loadMessages, SearchMode } from "state/commands";
import { IMessageState, IRoomState } from "state/mutators/chat";
import { usePrefs } from "state/contexts/prefs";

import { createController } from "ui/hooks/createController";
import { AnchoredModal } from "ui/components/modal/anchored";
import { PositionedModal } from "ui/components/modal/positioned";
import { createSimplePositionedContextMenu, createSimpleToggleOnClick, Hotkey, useMainHotkeys } from "ui/hooks/useMain";

import { Timeline } from "./timeline";
import { MsgContextMenu } from "../../menus/msg_context";
import { VectorIcon } from "ui/components/common/icon";

import { Anchor, InfiniteScroll, InfiniteScrollContext, InfiniteScrollController } from "ui/components/infinite_scroll";

import { Icons } from "lantern-icons";

function compute_goto(ifs: InfiniteScrollController | null): boolean {
    if(ifs) {
        let container = ifs.container;
        if(container) {
            let clientHeight = container.clientHeight,
                scrollHeight = container.scrollHeight - container.offsetHeight;

            return container.scrollTop < (scrollHeight - clientHeight * 5);
        }
    }

    return false;
}

import { createVirtualizedFeed } from "./virtual";
import { Message } from "../message";

import "./feed.scss";
export function MessageFeed() {
    let prefs = usePrefs();

    let state = useStructuredSelector({
        active_room: activeRoom,
        room: (state: RootState) => {
            let active_room = activeRoom(state);
            if(active_room) {
                return state.chat.rooms[active_room];
            }
            return;
        }
    });

    let dispatch = useRootDispatch();

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

    let [feed, on_load_prev, on_load_next] = createVirtualizedFeed();

    let has_timeline = () => false && !prefs.UseMobileView();

    return (
        <div class="ln-msg-list__flex-container">
            <Show when={has_timeline()}>
                <Timeline direction={0} position={0} />
            </Show>

            <Show when={__DEV__ && state.room?.locked}>
                Room is Loading
            </Show>

            <InfiniteScroll
                start={Anchor.Bottom}
                setController={setIFS}
                onScroll={on_scroll}
                load_prev={on_load_prev}
                containerClassList={{
                    'has-timeline': has_timeline(),
                    'compact': prefs.CompactView(),
                    'group-lines': prefs.GroupLines(),
                }}
            >
                <InfiniteScrollContext.Provider value={ifs as any}>
                    <ul class="ln-msg-list" id="ln-msg-list" >
                        <Show when={state.room?.fully_loaded}>
                            <TopOfChannel name={state.room!.room.name} />
                        </Show>

                        <For each={feed()}>
                            {msg => <Message msg={msg} />}
                        </For>
                    </ul>
                </InfiniteScrollContext.Provider>
            </InfiniteScroll>

            <div class="ln-feed-footers" classList={{ 'has-timeline': has_timeline() }}>
                <Show when={goto()}>
                    <GotoBottomFooter onClick={on_goto_click} use_mobile_view={prefs.UseMobileView()} />
                </Show>
            </div>
        </div>
    );
}

function TopOfChannel(props: { name: string }) {
    let { LL } = useI18nContext();

    return (
        <li class="ln-msg__top">
            <div class="ui-text">
                <VectorIcon id={Icons.Balloon} />{LL().main.channel.TOP1(props.name)}<VectorIcon id={Icons.Balloon} />
                <br />
                {LL().main.channel.TOP2()}
            </div>
        </li>
    )
}

interface IGotoBottomFooterProps {
    onClick(): void,
    use_mobile_view: boolean,
}

function GotoBottomFooter(props: IGotoBottomFooterProps) {
    let { LL } = useI18nContext();

    return () => props.use_mobile_view ? (
        <span id="goto-now" onClick={() => props.onClick()}>
            <VectorIcon id={Icons.ChevronDown} />
        </span>
    ) : (
        <div class="ln-feed-footer ui-text" onClick={() => props.onClick()}>
            <span textContent={LL().main.VIEWING_OLDER()} />
            <span id="goto-now">
                {LL().main.GOTO_NOW()} <VectorIcon id={Icons.ChevronDown} />
            </span>
        </div>
    );
}
