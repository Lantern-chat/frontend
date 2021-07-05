import React, { useContext, useRef, useMemo, useState, useEffect } from "react";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { createStructuredSelector } from 'reselect';

import dayjs from "lib/time";

import { Snowflake } from "state/models";
import { RootState, Type } from "state/root";
import { IChatState, IWindowState } from "state/reducers";
import { IMessageState } from "state/reducers/chat";
import { Panel } from "state/reducers/window";

import { pickColorFromHash } from "lib/palette";

import { Avatar } from "ui/components/common/avatar";
import { Message } from "./msg";
import { Timeline, ITimelineProps } from "./timeline";

const hasTimeline = typeof window.ResizeObserver !== 'undefined';

export interface IMessageListProps {
    channel: Snowflake
}

interface MessageGroupProps {
    group: IMessageState[],
    is_light_theme: boolean
}

const MessageGroup = ({ group, is_light_theme }: MessageGroupProps) => {
    let { msg } = group[0];
    let nickname = msg.member?.nick || msg.author.username;

    let list = group.map((msg, i) => {
        let message = <Message editing={false} msg={msg.msg} />;

        let side, ts = msg.ts.format("dddd, MMMM DD, h:mm A");
        if(i == 0) {
            let title = (
                <div className="ln-msg__title">
                    <span className="ln-msg__username">{nickname}</span>
                    <span className="ln-msg__ts" title={ts}>{msg.ts.calendar()}</span>
                </div>
            );

            message = (
                <div className="ln-msg__message">
                    {title}
                    {message}
                </div>
            );

            side = (
                <Avatar username={nickname} text={nickname.charAt(0)} backgroundColor={pickColorFromHash(msg.msg.author.id, is_light_theme)} />
            );
        } else {
            side = (
                <div className="ln-msg__sidets" title={ts}>{msg.ts.format('h:mm A')}</div>
            );
        }

        return (
            <div key={msg.msg.id} className="ln-msg__wrapper">
                <div className="ln-msg__side">
                    {side}
                </div>
                {message}
            </div>
        );
    });

    return (
        <li className="ln-msg-list__group">
            {list}
        </li>
    );
};

const feed_selector = createStructuredSelector({
    width: (state: RootState) => state.window.width,
    is_light_theme: (state: RootState) => state.theme.is_light,
    use_mobile_view: (state: RootState) => state.window.use_mobile_view,
    show_panel: (state: RootState) => state.window.show_panel,
});

import "./feed.scss";
export const MessageFeed = React.memo((props: IMessageListProps) => {
    let [scrollTop, setScrollTop] = useState(0);
    let dispatch = useDispatch();

    let room = useSelector((state: RootState) => state.chat.rooms.get(props.channel));
    let { width: windowWidth, is_light_theme, use_mobile_view, show_panel } = useSelector(feed_selector);

    let groups: IMessageState[][] = useMemo(() => {
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

    let feed = useMemo(() => {
        if(!room) {
            return <div className="ln-center-standalone">Channel does not exist</div>;
        }

        let showTimeline = windowWidth > 640,
            wrapperClasses = "ln-msg-list__wrapper ln-scroll-y",
            MaybeTimeline: React.FunctionComponent<ITimelineProps> = Timeline;

        if(!hasTimeline || !showTimeline) {
            MaybeTimeline = () => <></>;
        } else {
            wrapperClasses += ' has-timeline';
        }

        let on_scroll = (event: React.UIEvent<HTMLDivElement>) => {
            let t = event.currentTarget;

            let at_top = t.scrollTop == 0, at_bottom = (t.scrollTop == (t.scrollHeight - t.offsetHeight));

            //if(use_mobile_view) {
            //    let delta = scrollTop - t.scrollTop;
            //    if(delta != 0 && (at_top || at_bottom)) {
            //        event.preventDefault();
            //    }
            //}


            setScrollTop(t.scrollTop);
        };


        return (
            <>
                <MaybeTimeline direction={0} position={0} />
                <div className={wrapperClasses} onScroll={on_scroll} >
                    <ul className="ln-msg-list" >
                        {groups.map(group => <MessageGroup key={group[0].msg.id} group={group} is_light_theme={is_light_theme} />)}
                    </ul>
                </div>
            </>
        );
    }, [groups]);

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
            {feed}
        </div>
    );
});