import React, { useContext, useRef, useMemo, useState, useEffect, useCallback } from "react";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { createStructuredSelector } from 'reselect';

import { useResizeDetector } from "react-resize-detector/build/withPolyfill";

import dayjs from "lib/time";

import { Attachment, Snowflake, Message as MessageModel } from "state/models";
import { RootState, Type } from "state/root";
import { IChatState, IWindowState } from "state/reducers";
import { IMessageState } from "state/reducers/chat";
import { Panel } from "state/reducers/window";

import { message_attachment_url, user_avatar_url } from "config/urls";

import { pickColorFromHash } from "lib/palette";

import { Avatar } from "ui/components/common/avatar";
import { Message } from "./msg";
import { Timeline, ITimelineProps } from "./timeline";

import throttle from 'lodash/throttle';

export interface IMessageListProps {
    channel: Snowflake
}

interface MessageGroupProps {
    group: IMessageState[],
    is_light_theme: boolean
}

const Attachment = React.memo(({ msg, attachment }: { msg: MessageModel, attachment: Attachment }) => {
    let [error, setError] = useState(false);

    let embed, mime = attachment.mime,
        url = message_attachment_url(msg.room_id, attachment.id, attachment.filename);

    if(mime && !error) {
        if(mime.startsWith('video')) {
            embed = <video src={url} controls onError={() => setError(true)} />;
        } else if(mime.startsWith('audio')) {
            embed = <audio src={url} controls onError={() => setError(true)} />
        } else if(mime.startsWith('image')) {
            embed = <img src={url} onError={() => setError(true)} />;
        }
    }

    if(!embed) {
        embed = <a target="__blank" href={url}>{attachment.filename}</a>;
    }

    return (
        <div className="ln-msg-attachment">
            <div title={attachment.filename}>
                {embed}
            </div>
        </div>
    )
});

// NOTE: Because `group` is recomputed below as part of `groups`, this will always render.
const MessageGroup = ({ group, is_light_theme }: MessageGroupProps) => {
    let { msg } = group[0];
    let nickname = msg.member?.nick || msg.author.username;

    return (
        <li className="ln-msg-list__group">
            {group.map((msg, i) => {
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

                    let avatar_url, author = msg.msg.author;
                    if(author.avatar) {
                        avatar_url = user_avatar_url(author.id, author.avatar);
                    }

                    side = (
                        <Avatar username={nickname} text={nickname.charAt(0)} url={avatar_url} backgroundColor={pickColorFromHash(msg.msg.author.id, is_light_theme)} />
                    );
                } else {
                    side = (
                        <div className="ln-msg__sidets" title={ts}>{msg.ts.format('h:mm A')}</div>
                    );
                }

                let attachments, a = msg.msg.attachments;
                if(a && a.length) {
                    attachments = a.map(attachment => <Attachment key={attachment.id} msg={msg.msg} attachment={attachment} />)
                }

                return (
                    <div key={msg.msg.id}>
                        <div className="ln-msg__wrapper">
                            <div className="ln-msg__side">
                                {side}
                            </div>
                            {message}
                        </div>
                        {attachments}
                    </div>
                );
            })}
        </li>
    );
};

const feed_selector = createStructuredSelector({
    is_light_theme: (state: RootState) => state.theme.is_light,
    use_mobile_view: (state: RootState) => state.window.use_mobile_view,
    show_panel: (state: RootState) => state.window.show_panel,
});

import "./feed.scss";
export const MessageFeed = React.memo((props: IMessageListProps) => {
    let [scrollPos, setScrollPos] = useState(0);
    let dispatch = useDispatch();

    let room = useSelector((state: RootState) => state.chat.rooms.get(props.channel));
    let { is_light_theme, use_mobile_view, show_panel } = useSelector(feed_selector);

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

    let container_ref = useRef<HTMLDivElement>(null);
    const { width, height, ref: ul_ref } = useResizeDetector<HTMLUListElement>();

    let on_scroll = useCallback(throttle((event: React.UIEvent<HTMLDivElement>) => {
        let t = event.currentTarget;
        if(!t) return;

        let at_top = t.scrollTop == 0, at_bottom = (t.scrollTop == (t.scrollHeight - t.offsetHeight));

        //if(use_mobile_view) {
        //    let delta = scrollTop - t.scrollTop;
        //    if(delta != 0 && (at_top || at_bottom)) {
        //        event.preventDefault();
        //    }
        //}


        setScrollPos(t.scrollTop);
    }, 100), []); // TODO: This will probably have dependencies

    let feed = useMemo(() => {
        if(!room) {
            return <div className="ln-center-standalone">Channel does not exist</div>;
        }

        let wrapperClasses = "ln-msg-list__wrapper ln-scroll-y",
            MaybeTimeline: React.FunctionComponent<ITimelineProps> = Timeline;

        if(use_mobile_view) {
            MaybeTimeline = () => <></>;
        } else {
            wrapperClasses += ' has-timeline';
        }

        return (
            <>
                <MaybeTimeline direction={0} position={0} />
                <div className={wrapperClasses} onScroll={on_scroll} ref={container_ref}>
                    <ul className="ln-msg-list" ref={ul_ref}>
                        {groups.map(group => <MessageGroup key={group[0].msg.id} group={group} is_light_theme={is_light_theme} />)}
                    </ul>
                </div>
            </>
        );
    }, [groups, ul_ref, on_scroll]);

    useEffect(() => {
        let elem = container_ref.current;
        if(elem) {
            elem.scrollTo({ top: elem.scrollHeight });
        }
    }, [height, container_ref.current]);

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