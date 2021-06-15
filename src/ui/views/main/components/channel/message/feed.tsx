import React, { useContext, useRef, useMemo, useState, useEffect } from "react";
import { useSelector, shallowEqual } from "react-redux";

import { Snowflake } from "state/main/models";
import { RootState, Type } from "state/main";
import { IChatState, IWindowState } from "state/main/reducers";

import { Message } from "./msg";
import { Timeline, ITimelineProps } from "./timeline";

const hasTimeline = typeof window.ResizeObserver !== 'undefined';

export interface IMessageListProps {
    channel: Snowflake
}

import "./feed.scss";
export const MessageFeed = React.memo((props: IMessageListProps) => {
    let { room, width: windowWidth } = useSelector((state: RootState) => ({
        room: state.chat.rooms.get(props.channel),
        width: state.window.width,
    }));

    let feed;

    if(room == null) {
        feed = <div className="ln-center-standalone">Channel does not exist</div>;
    } else {

        const showTimeline = windowWidth > 640;

        let wrapperClasses = "ln-msg-list__wrapper ln-scroll-y ln-scroll-fixed";

        let MaybeTimeline: React.FunctionComponent<ITimelineProps> = Timeline;
        if(!hasTimeline || !showTimeline) {
            MaybeTimeline = () => <></>;
        } else {
            wrapperClasses += ' has-timeline';
        }

        feed = (
            <>
                <MaybeTimeline direction={0} position={0} />

                <div className={wrapperClasses}>
                    <ul className="ln-msg-list">
                        {room.msgs.map(msg_state => (
                            <li key={msg_state.msg.id} className="ln-msg-list__group">
                                <Message editing={false} msg={msg_state.msg} />
                            </li>
                        ))}
                    </ul>
                </div>
            </>
        );
    }

    return (
        <div className="ln-msg-list__flex-container">
            {feed}
        </div>
    );
});