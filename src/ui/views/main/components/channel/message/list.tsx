import React, { useContext, useRef, useMemo, useState, useEffect } from "react";
import { useSelector, shallowEqual } from "react-redux";

import { IMessageState } from "ui/views/main/state/reducers/messages";
import { IWindowState } from "ui/views/main/state/state/window";
import { RootState } from "ui/views/main/state/reducers";

import { Message } from "./msg";
import { Timeline, ITimelineProps } from "./timeline";

const hasTimeline = typeof window.ResizeObserver !== 'undefined';

import "./list.scss";
export const MessageList = React.memo(() => {
    // TODO: Combine these
    let { messages, current_edit }: IMessageState = useSelector((state: RootState) => state.messages);

    let { width: windowWidth }: IWindowState = useSelector((state: RootState) => state.window);
    const showTimeline = windowWidth > 640;

    let wrapperClasses = "ln-msg-list__wrapper ln-scroll-y ln-scroll-fixed";

    let MaybeTimeline: React.FunctionComponent<ITimelineProps> = Timeline;
    if(!hasTimeline || !showTimeline) {
        MaybeTimeline = () => <></>;
    } else {
        wrapperClasses += ' has-timeline';
    }

    return (
        <div className="ln-msg-list__flex-container">
            <MaybeTimeline direction={0} position={0} />

            <div className={wrapperClasses}>
                <ul className="ln-msg-list">
                    {messages.map(msg => (
                        <li key={msg.id} className="ln-msg-list__group">
                            <Message {...msg} editing={msg.id === current_edit} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
});