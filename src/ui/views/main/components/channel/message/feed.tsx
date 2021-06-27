import React, { useContext, useRef, useMemo, useState, useEffect } from "react";
import { useSelector, shallowEqual } from "react-redux";
import dayjs from "lib/time";

import { Snowflake } from "state/models";
import { RootState, Type } from "state/root";
import { IChatState, IWindowState } from "state/reducers";
import { IMessageState } from "state/reducers/chat";

import { Message } from "./msg";
import { Timeline, ITimelineProps } from "./timeline";

const hasTimeline = typeof window.ResizeObserver !== 'undefined';

export interface IMessageListProps {
    channel: Snowflake
}

const MessageGroup = ({ group }: { group: IMessageState[] }) => {
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
                <Avatar username={nickname} text={nickname.charAt(0)} backgroundColor="#999" />
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

import "./feed.scss";
import { Avatar } from "ui/components/common/avatar";
export const MessageFeed = React.memo((props: IMessageListProps) => {
    let [scroll, setScroll] = useState(0);

    let { room, width: windowWidth } = useSelector((state: RootState) => ({
        room: state.chat.rooms.get(props.channel),
        width: state.window.width,
    }));

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

    }, [room && room.msgs]);

    let feed = useMemo(() => {
        if(room == null) {
            return <div className="ln-center-standalone">Channel does not exist</div>;
        }

        const showTimeline = windowWidth > 640;

        let wrapperClasses = "ln-msg-list__wrapper ln-scroll-y";

        let MaybeTimeline: React.FunctionComponent<ITimelineProps> = Timeline;
        if(room != null && hasTimeline && showTimeline) {
            MaybeTimeline = () => <></>;
        } else {
            wrapperClasses += ' has-timeline';
        }

        let on_scroll = (event: React.UIEvent<HTMLDivElement>) => {
            //console.log(event);
        };

        let feed_inner = (
            <div className={wrapperClasses} onScroll={on_scroll}>
                <ul className="ln-msg-list">
                    {groups.map(group => <MessageGroup key={group[0].msg.id} group={group} />)}
                </ul>
            </div>
        );

        return (
            <>
                <MaybeTimeline direction={0} position={0} />
                {feed_inner}
            </>
        );

    }, [groups]);

    return (
        <div className="ln-msg-list__flex-container">
            {feed}
        </div>
    );
});