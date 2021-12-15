import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createStructuredSelector } from 'reselect';
import classNames from "classnames";

import { shallowEqualObjects } from "lib/compare";

import { Room, Snowflake, User, UserPreferenceFlags } from "state/models";
import { RootState, Type } from "state/root";
import { loadMessages, SearchMode } from "state/commands";
import { IMessageState, IRoomState } from "state/reducers/chat";
import { Panel } from "state/reducers/window";
import { selectPrefsFlag } from "state/selectors/prefs";

import { Glyphicon } from "ui/components/common/glyphicon";
import { Timeline, ITimelineProps } from "./timeline";
import { MessageGroup } from "../message/group";

export interface IMessageListProps {
    channel: Snowflake
}

const feed_selector = createStructuredSelector({
    use_mobile_view: (state: RootState) => state.window.use_mobile_view,
    show_panel: (state: RootState) => state.window.show_panel,
});

// NOTE: Don't include fields that are updated often
type PartialRoomState = Pick<IRoomState, 'room' | 'fully_loaded' | 'msgs'>;

import "./feed.scss";
export const MessageFeed = React.memo((props: IMessageListProps) => {
    let dispatch = useDispatch();

    let { use_mobile_view, show_panel } = useSelector(feed_selector);
    let room = useSelector((state: RootState): PartialRoomState | undefined => {
        let room_state = state.chat.rooms.get(props.channel);
        if(room_state) {
            return {
                room: room_state.room,
                fully_loaded: room_state.fully_loaded,
                msgs: room_state.msgs
            };
        }
        return;
    }, shallowEqualObjects);


    //useTitle(room?.room.name);

    let groups: Array<IMessageState[]> = useMemo(() => {
        if(!room) return [];

        __DEV__ && console.log("REBUILDING GROUPS");


        let groups: IMessageState[][] = [];

        for(let msg of room.msgs) {
            let last_group = groups[groups.length - 1];

            if(last_group) {
                let last_msg = last_group[last_group.length - 1];

                if(last_msg.msg.author.id == msg.msg.author.id && msg.ts.diff(last_msg.ts) < (1000 * 60 * 5)) {
                    last_group.push(msg);
                    continue;
                }
            }

            groups.push([msg]);
        }

        return groups;

    }, [room?.msgs]);

    let cover;
    if(use_mobile_view && show_panel != Panel.Main) {
        let on_click = () => {
            switch(show_panel) {
                case Panel.LeftRoomList: {
                    dispatch({ type: Type.WINDOW_TOGGLE_ROOM_LIST_SIDEBAR });
                    break;
                }
                case Panel.RightUserList: {
                    dispatch({ type: Type.WINDOW_TOGGLE_USER_LIST_SIDEBAR });
                    break;
                }
            }
        };

        cover = (
            <div className="ln-msg-list__cover" onClick={on_click} />
        );
    }

    return (
        <div className="ln-msg-list__flex-container">
            {cover}
            <MessageFeedInner room={room} groups={groups} />
        </div>
    );
});

interface IMessageFeedInnerProps {
    room: PartialRoomState | undefined,
    groups: Array<IMessageState[]>,
}

const inner_feed_selector = createStructuredSelector({
    use_mobile_view: (state: RootState) => state.window.use_mobile_view,
    is_light_theme: selectPrefsFlag(UserPreferenceFlags.LightMode),
    compact: selectPrefsFlag(UserPreferenceFlags.CompactView),
    gl: selectPrefsFlag(UserPreferenceFlags.GroupLines),
    reduce_motion: selectPrefsFlag(UserPreferenceFlags.ReduceAnimations),
});

import { Anchor, InfiniteScroll } from "ui/components/infinite_scroll2";

const NoTimeline = React.memo(() => <></>);

import { Hotkey, useMainHotkeys } from "ui/hooks/useMainClick";
const HOTKEYS = [Hotkey.FeedArrowDown, Hotkey.FeedArrowUp, Hotkey.FeedPageDown, Hotkey.FeedPageUp, Hotkey.FeedEnd];

function compute_goto(ifs: InfiniteScroll, pos: number): boolean {
    let container = ifs.containerRef.current;
    if(!container) return false;

    let clientHeight = container.clientHeight,
        scrollHeight = container.scrollHeight - container.offsetHeight;

    return pos < (scrollHeight - clientHeight * 5);
}

const MessageFeedInner = React.memo(({ room, groups }: IMessageFeedInnerProps) => {
    let { use_mobile_view, is_light_theme, compact, gl, reduce_motion } = useSelector(inner_feed_selector),
        dispatch = useDispatch(),
        infinite_scroll = useRef<InfiniteScroll>(null),
        [load_next, load_prev]: Array<undefined | (() => void)> = useMemo(() => {
            if(!room || room.fully_loaded) return [];

            __DEV__ && console.log("REBUILDING LOADING CALLBACKS");

            return [
                () => { }, // TODO: Virtualization
                () => {
                    if(groups[0]) {
                        dispatch(loadMessages(room.room.id, groups[0][0].msg.id, SearchMode.Before));
                    }
                }
            ]
        }, [room, groups]);

    useMainHotkeys(HOTKEYS, (hotkey: Hotkey, e: KeyboardEvent) => {
        let ifs = infinite_scroll.current;
        if(!ifs) return;

        switch(hotkey) {
            case Hotkey.FeedArrowDown: ifs.scrollArrowDown(); break;
            case Hotkey.FeedArrowUp: ifs.scrollArrowUp(); break;
            case Hotkey.FeedPageDown: ifs.scrollPageDown(); break;
            case Hotkey.FeedPageUp: ifs.scrollPageUp(); break;
            case Hotkey.FeedEnd: ifs.goToStart(); break;
        }
    }, [infinite_scroll.current]);

    let initial_goto = useMemo(() => {
        let ifs = infinite_scroll.current;
        return !!ifs && compute_goto(ifs, ifs.pos);
    }, [infinite_scroll.current, groups])

    let [goto, setGoto] = useState(initial_goto);
    let onScroll = useCallback((pos: number) => {
        let ifs = infinite_scroll.current;
        if(ifs) setGoto(compute_goto(ifs, pos));
    }, [infinite_scroll.current]);

    // Use effect to only dispatch on meaningful changes
    useEffect(() => {
        dispatch({ type: Type.TOGGLE_FOOTERS, show: goto });
    }, [goto]);

    let onGoto = useCallback(() => {
        let ifs = infinite_scroll.current;
        if(!ifs) return;

        ifs.goToStartSmooth();
    }, [infinite_scroll.current]);

    if(!room) {
        return <div className="ln-center-standalone">Channel does not exist</div>;
    }

    let MaybeTimeline: React.FunctionComponent<ITimelineProps> = use_mobile_view ? NoTimeline : Timeline,
        wrapperClasses = classNames({
            'has-timeline': !use_mobile_view,
            'compact': compact,
            'group-lines': gl,
        }),
        footerClasses = classNames("ln-feed-footers", {
            'has-timeline': !use_mobile_view,
        });

    return (
        <>
            <MaybeTimeline direction={0} position={0} />

            <InfiniteScroll ref={infinite_scroll} start={Anchor.Bottom}
                load_next={load_next} load_prev={load_prev}
                reset_on_changed={room.room.id}
                containerClassName={wrapperClasses}
                onScroll={onScroll}
                reduce_motion={reduce_motion}
            >

                <MsgList room={room} groups={groups} is_light_theme={is_light_theme} compact={compact} />
            </InfiniteScroll>

            <div className={footerClasses}>
                {goto && <GotoBottomFooter onClick={onGoto} use_mobile_view={use_mobile_view} />}
            </div>
        </>
    )
});

const MsgList = React.memo(({ room, groups, is_light_theme, compact }: { room: PartialRoomState, groups: IMessageState[][], is_light_theme: boolean, compact: boolean }) => {
    let header;
    if(room.fully_loaded) {
        header = (<MsgTop room={room.room} />)
    }

    return (
        <ul className="ln-msg-list" id="ln-msg-list" >
            {header}
            {groups.map(group => <MessageGroup key={group[0].msg.id} group={group} is_light_theme={is_light_theme} compact={compact} />)}
        </ul>
    );
});

import Balloon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-882-balloon.svg";

const MsgTop = React.memo(({ room }: { room: Room }) => {
    return (
        <li className="ln-msg__top">
            <div className="ui-text">
                <Glyphicon src={Balloon} /> You have reached the top of #{room.name}! <Glyphicon src={Balloon} />
                <br />
                Congrats on making it this far.
            </div>
        </li>
    )
});

interface IGotoBottomFooterProps {
    onClick(): void,
    use_mobile_view: boolean,
}

import ChevronDown from "icons/glyphicons-pro/glyphicons-halflings-2-3/svg/individual-svg/glyphicons-halflings-128-chevron-down.svg";

const GotoBottomFooter = React.memo(({ onClick, use_mobile_view }: IGotoBottomFooterProps) => {
    if(use_mobile_view) {
        return (
            <span id="goto-now" onClick={() => onClick()}>
                <Glyphicon src={ChevronDown} />
            </span>
        )
    }

    return (
        <div className="ln-feed-footer ui-text" onClick={() => onClick()}>
            <span>You're viewing older messages</span>
            <span id="goto-now">
                Go to now <Glyphicon src={ChevronDown} />
            </span>
        </div>
    );
});

if(__DEV__) {
    MessageFeed.displayName = "MessageFeed";
    NoTimeline.displayName = "NoTimeline";
    MessageFeedInner.displayName = "MessageFeedInner";
    MsgList.displayName = "MsgList";
    MsgTop.displayName = "MsgTop";
    GotoBottomFooter.displayName = "GotoBottomFooter";
}