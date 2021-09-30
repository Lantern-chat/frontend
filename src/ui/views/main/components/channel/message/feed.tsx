import React, { useContext, useRef, useMemo, useState, useEffect, useCallback, useReducer, useLayoutEffect } from "react";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { createStructuredSelector } from 'reselect';

import { useResizeDetector } from "react-resize-detector/build/withPolyfill";

import dayjs from "lib/time";

import { Attachment, Snowflake, Message as MessageModel, Room, User } from "state/models";
import { RootState, Type } from "state/root";
import { IChatState, IWindowState } from "state/reducers";
import { loadMessages, SearchMode } from "state/commands";
import { IMessageState } from "state/reducers/chat";
import { Panel } from "state/reducers/window";

import { message_attachment_url, user_avatar_url } from "config/urls";

import { pickColorFromHash } from "lib/palette";

import { useTitle } from "ui/hooks/useTitle";
import { Avatar } from "ui/components/common/avatar";
import { Message } from "./msg";
import { Timeline, ITimelineProps } from "./timeline";
import { AnchoredModal } from "ui/components/anchored_modal";
import { PositionedModal } from "ui/components/positioned_modal";
import { MsgContextMenu } from "../../menus/msg_context";
import { UserCard } from "../../menus/user_card";

import { useMainClick } from "ui/hooks/useMainClick";

import throttle from 'lodash/throttle';

export interface IMessageListProps {
    channel: Snowflake
}

interface GroupMessageProps {
    msg: IMessageState,
    is_light_theme: boolean,
    nickname: string,
    first: boolean,
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

interface IUserNameProps {
    name: string,
    user: User,
}

const UserName = React.memo((props: IUserNameProps) => {
    let [show, setShow] = useState(false);

    let main_click_props = useMainClick({
        active: show,
        onMainClick: () => setShow(false),
        onClick: (e: React.MouseEvent) => {
            setShow(true);
            e.stopPropagation();
        }
    }, []);

    return (
        <span className="ln-msg__username" {...main_click_props}>
            <AnchoredModal show={show}>
                <UserCard user={props.user} />
            </AnchoredModal>
            {props.name}
        </span>
    )
});

const GroupMessage = React.memo(({ msg, is_light_theme, nickname, first }: GroupMessageProps) => {
    let message = <Message editing={false} msg={msg.msg} />;

    let side, ts = msg.ts.format("dddd, MMMM DD, h:mm A");
    if(first) {
        let title = (
            <div className="ln-msg__title">
                <UserName name={nickname} user={msg.msg.author} />

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

    let [pos, setPos] = useState<{ top: number, left: number } | null>(null);

    let cm;

    if(pos) {
        cm = (
            <div className="ln-msg__cm">
                <PositionedModal top={pos.top} left={pos.left}>
                    <MsgContextMenu msg={msg} />
                </PositionedModal>
            </div>
        );
    }

    let main_click_props = useMainClick({
        active: !!pos,
        onMainClick: () => setPos(null),
        onContextMenu: (e: React.MouseEvent) => {
            setPos({ top: e.clientY, left: e.clientX })
        },
    }, []);

    let wrapper_class = "ln-msg__wrapper";
    if(cm) {
        wrapper_class += " highlighted";
    }

    return (
        <div key={msg.msg.id} {...main_click_props}>
            <div className={wrapper_class}>
                <div className="ln-msg__side">
                    {side}
                </div>
                {message}
                {cm}
            </div>
            {attachments}
        </div>
    );
});

// NOTE: Because `group` is recomputed below as part of `groups`, this will always render.
const MessageGroup = ({ group, is_light_theme }: MessageGroupProps) => {
    let { msg } = group[0];
    let nickname = msg.member?.nick || msg.author.username;

    return (
        <li className="ln-msg-list__group">
            {group.map((msg, i) => <GroupMessage key={msg.msg.id} msg={msg} nickname={nickname} is_light_theme={is_light_theme} first={i == 0} />)}
        </li>
    );
};

const feed_selector = createStructuredSelector({
    is_light_theme: (state: RootState) => state.prefs.light,
    use_mobile_view: (state: RootState) => state.window.use_mobile_view,
    show_panel: (state: RootState) => state.window.show_panel,
});


import "./feed.scss";
export const MessageFeed = React.memo((props: IMessageListProps) => {
    let dispatch = useDispatch();

    let room = useSelector((state: RootState) => state.chat.rooms.get(props.channel));
    let { is_light_theme, use_mobile_view, show_panel } = useSelector(feed_selector);

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
            <MessageFeedInner room={!!room} groups={groups} use_mobile_view={use_mobile_view} is_light_theme={is_light_theme} />
        </div>
    );
});

enum ScrollAnchor {
    Top,
    Scrolling,
    Bottom,
}

interface IScrollState {
    pos: number,
    anchor: ScrollAnchor,
    height: number,
    old_height: number,
}

const SCROLL_STATE: IScrollState = {
    anchor: ScrollAnchor.Bottom,
    pos: 0,
    height: 0,
    old_height: 0,
};

enum ScrollActionType {
    Scroll,
    HeightChange,
}

interface ScrollActionScroll {
    type: ScrollActionType.Scroll,
    pos: number,
    anchor: ScrollAnchor
}

interface ScrollActionHeightChange {
    type: ScrollActionType.HeightChange,
    h: number,
    pos: number,
}

type ScrollAction = ScrollActionScroll | ScrollActionHeightChange;

function scrollStateReducer(state: IScrollState, action: ScrollAction): IScrollState {
    switch(action.type) {
        case ScrollActionType.Scroll: {
            __DEV__ && console.log("ANCHOR SET TO: ", ScrollAnchor[action.anchor]);
            return { ...state, pos: action.pos, anchor: action.anchor };
        }
        case ScrollActionType.HeightChange: return { ...state, height: action.h, old_height: action.h != state.height ? state.height : state.old_height, pos: action.pos };
    }

    return state;
}


interface IMessageFeedInnerProps {
    room: boolean,
    groups: Array<IMessageState[]>,
    use_mobile_view: boolean,
    is_light_theme: boolean,
}

function compute_at(e: HTMLElement, top_threshold: number, bottom_threshold: number): ScrollAnchor {
    let scroll_height = e.scrollHeight - e.offsetHeight,
        scroll_top = e.scrollTop;

    if(scroll_top < top_threshold) {
        return ScrollAnchor.Top;
    } else if((scroll_height - scroll_top) < bottom_threshold) {
        return ScrollAnchor.Bottom;
    } else {
        return ScrollAnchor.Scrolling;
    }
}

const inner_selector = createStructuredSelector({
    active_room: (state: RootState) => state.chat.active_room,
    window_height: (state: RootState) => state.window.height,
})

function debounce<T, R>(cb: (x: T) => R): (x: T) => R {
    return (x: T) => {
        return cb(x);
    };
}

const MessageFeedInner = React.memo(({ room, groups, use_mobile_view, is_light_theme }: IMessageFeedInnerProps) => {
    let container_ref = useRef<HTMLDivElement>(null);

    let [state, scrollDispatch] = useReducer(scrollStateReducer, SCROLL_STATE);

    let on_resize = useCallback((_width: number | undefined, height: number | undefined) => {
        let container = container_ref.current;
        if(container && height !== undefined) {
            let top = state.pos;
            if(state.anchor == ScrollAnchor.Bottom) {
                top = container.scrollHeight;
                __DEV__ && console.log("SCROLLING TO BOTTOM: ", top);
                container.scrollTo({ top });
            } else {
                //console.log("HEIGHTS: ", container.scrollHeight, list.clientHeight, state.height, state.old_height);

                console.log("HEIGHTS: ", container.scrollHeight, height, state.height, state.pos, container.scrollTop);

                let diff = height - state.height;
                top = top + diff;
                container.scrollTo({ top });
            }

            scrollDispatch({ type: ScrollActionType.HeightChange, h: height, pos: top });
        }
    }, [state, container_ref.current]);

    const { ref: ul_ref } = useResizeDetector<HTMLUListElement>({
        onResize: on_resize,
    });

    let { active_room, window_height } = useSelector(inner_selector);
    let dispatch = useDispatch();

    let load_messages = useCallback(throttle(() => {
        if(active_room && groups[0]) {
            dispatch(loadMessages(active_room, groups[0][0].msg.id, SearchMode.Before));
        }
    }, 500), [active_room, groups]);

    let on_scroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
        let t = event.currentTarget;
        if(!t) return;

        __DEV__ && console.log("SCROLLED");

        let anchor = compute_at(t, window_height * 0.75, window_height * 0.35);

        if(anchor == ScrollAnchor.Top) {
            load_messages();
        }

        scrollDispatch({ type: ScrollActionType.Scroll, pos: t.scrollTop, anchor });
    }, [load_messages, window_height]); // TODO: This will probably have dependencies

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
})