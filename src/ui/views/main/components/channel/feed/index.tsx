import React, { useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { createStructuredSelector } from 'reselect';
import classNames from "classnames";

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

import "./feed.scss";
export const MessageFeed = React.memo((props: IMessageListProps) => {
    let dispatch = useDispatch();

    let room = useSelector((state: RootState) => state.chat.rooms.get(props.channel));
    let { use_mobile_view, show_panel } = useSelector(feed_selector);

    //useTitle(room?.room.name);

    let groups: Array<IMessageState[]> = useMemo(() => {
        if(room == null) return [];

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
    room: IRoomState | undefined,
    groups: Array<IMessageState[]>,
}

const inner_feed_selector = createStructuredSelector({
    use_mobile_view: (state: RootState) => state.window.use_mobile_view,
    is_light_theme: selectPrefsFlag(UserPreferenceFlags.LightMode),
    compact: selectPrefsFlag(UserPreferenceFlags.CompactView),
    gl: selectPrefsFlag(UserPreferenceFlags.GroupLines),
});

import { Anchor, InfiniteScroll } from "ui/components/infinite_scroll2";

const NoTimeline = React.memo(() => <></>);

const MessageFeedInner = React.memo(({ room, groups }: IMessageFeedInnerProps) => {
    let { use_mobile_view, is_light_theme, compact, gl } = useSelector(inner_feed_selector);
    let dispatch = useDispatch();

    let [load_next, load_prev]: Array<undefined | (() => void)> = useMemo(() => {
        if(!room || room.fully_loaded) return [];

        return [
            () => { }, // TODO: Virtualization
            () => {
                if(room && groups[0]) {
                    dispatch(loadMessages(room.room.id, groups[0][0].msg.id, SearchMode.Before));
                }
            }
        ]
    }, [room, groups]);

    if(!room) {
        return <div className="ln-center-standalone">Channel does not exist</div>;
    }

    let MaybeTimeline: React.FunctionComponent<ITimelineProps> = use_mobile_view ? NoTimeline : Timeline,
        wrapperClasses = classNames({
            'has-timeline': !use_mobile_view,
            'compact': compact,
            'group-lines': gl,
        });

    return (
        <>
            <MaybeTimeline direction={0} position={0} />
            <InfiniteScroll start={Anchor.Bottom}
                load_next={load_next} load_prev={load_prev}
                reset_on_changed={room.room.id}
                containerClassName={wrapperClasses}
            >

                <MsgList room={room} groups={groups} is_light_theme={is_light_theme} compact={compact} />

            </InfiniteScroll>
        </>
    )
});

const MsgList = React.memo(({ room, groups, is_light_theme, compact }: { room: IRoomState, groups: IMessageState[][], is_light_theme: boolean, compact: boolean }) => {
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