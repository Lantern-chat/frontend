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
            <div title={attachment.filename} onContextMenu={(e) => e.stopPropagation()}>
                {embed}
            </div>
        </div>
    )
});

interface IUserNameProps {
    name: string,
    user: User,
    is_light_theme?: boolean,
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
        <span className="ln-msg__username ui-text" {...main_click_props}>
            <AnchoredModal show={show}>
                <UserCard user={props.user} />
            </AnchoredModal>
            {props.name}
        </span>
    )
});

const UserAvatar = React.memo(({ name, user, is_light_theme }: IUserNameProps) => {
    let [show, setShow] = useState(false);

    let main_click_props = useMainClick({
        active: show,
        onMainClick: () => setShow(false),
        onClick: (e: React.MouseEvent) => {
            setShow(true);
            e.stopPropagation();
        }
    }, []);

    let avatar_url;
    if(user.avatar) {
        avatar_url = user_avatar_url(user.id, user.avatar);
    }

    let anchor = (
        <AnchoredModal show={show}>
            <UserCard user={user} />
        </AnchoredModal>
    );

    return (
        <Avatar
            username={name}
            text={name.charAt(0)}
            url={avatar_url}
            backgroundColor={pickColorFromHash(user.id, !!is_light_theme)}
            props={main_click_props}
            anchor={anchor} />
    )
});

const GroupMessage = React.memo(({ msg, is_light_theme, nickname, first }: GroupMessageProps) => {
    let message = <Message editing={false} msg={msg.msg} />;

    let side, ts = msg.ts.format("dddd, MMMM DD, h:mm A");
    if(first) {
        let title = (
            <div className="ln-msg__title">
                <UserName name={nickname} user={msg.msg.author} />

                <span className="ln-separator"> - </span>

                <span className="ln-msg__ts" title={ts}>
                    <span className="ui-text">{msg.ts.calendar()}</span>
                </span>
            </div>
        );

        message = (
            <div className="ln-msg__message">
                {title}
                {message}
            </div>
        );

        side = (
            <UserAvatar user={msg.msg.author} name={nickname} is_light_theme={is_light_theme} />
        );
    } else {
        side = (
            <div className="ln-msg__sidets" title={ts}>
                <span className="ui-text">{msg.ts.format('h:mm A')}</span>
            </div>
        );
    }

    let attachments, a = msg.msg.attachments;
    if(a && a.length) {
        attachments = a.map(attachment => <Attachment key={attachment.id} msg={msg.msg} attachment={attachment} />)
    }

    let [pos, setPos] = useState<{ top: number, left: number } | null>(null);
    let [warn, setWarn] = useState(false);

    let cm;

    if(pos) {
        cm = (
            <div className="ln-msg__cm">
                <PositionedModal top={pos.top} left={pos.left}>
                    <MsgContextMenu msg={msg} pos={pos} onConfirmChange={(pending: boolean) => setWarn(pending)} />
                </PositionedModal>
            </div>
        );
    }

    let main_click_props = useMainClick({
        active: !!pos,
        onMainClick: () => { setPos(null); setWarn(false); },
        onContextMenu: (e: React.MouseEvent) => {
            setPos({ top: e.clientY, left: e.clientX })
        },
    }, []);

    let outer_class = "ln-msg__outer";
    if(cm) {
        outer_class += " highlighted";

        if(warn) {
            outer_class += " warning";
        }
    }

    return (
        <div key={msg.msg.id} className={outer_class} {...main_click_props}>
            <div className="ln-msg__wrapper">
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
}

const SCROLL_STATE: IScrollState = {
    anchor: ScrollAnchor.Bottom,
    pos: 0,
    height: 0,
};

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

const MessageFeedInner = React.memo(({ room, groups, use_mobile_view, is_light_theme }: IMessageFeedInnerProps) => {

    let { active_room, window_height } = useSelector(inner_selector);
    let dispatch = useDispatch();

    let container_ref = useRef<HTMLDivElement>(null);

    let { on_resize, on_state, state } = useMemo(() => {
        var state = SCROLL_STATE;

        let on_state = (new_state: Partial<IScrollState>) => {
            // copy into referenced state
            for(let prop in new_state) {
                state[prop] = new_state[prop];
            }
            //console.info(state);
        };

        let on_resize = (_width: number | undefined, height: number | undefined) => {
            let container = container_ref.current;
            if(container && height !== undefined && height != state.height) {
                let top = state.pos;

                if(state.anchor == ScrollAnchor.Bottom) {
                    top = container.scrollHeight;
                    __DEV__ && console.log("SCROLLING TO BOTTOM: ", top);

                } else {
                    //console.log("HEIGHTS: ", container.scrollHeight, list.clientHeight, state.height, state.old_height);
                    //console.log("HEIGHTS: ", container.scrollHeight, height, state.height, state.pos, container.scrollTop);

                    let diff = height - state.height;
                    top = top + diff;
                }

                if(top != container.scrollTop) {
                    container.scrollTo({ top });
                }

                state.pos = top;
                state.height = height;
            }
        };

        return { on_resize, on_state, state };
    }, [container_ref.current]);

    // force resize check when we absolutely know the DOM just changed
    useLayoutEffect(() => on_resize(undefined, container_ref.current?.scrollHeight), [groups, on_resize]);
    useLayoutEffect(() => {
        // force to bottom when changing rooms
        on_state({ anchor: ScrollAnchor.Bottom });
        on_resize(undefined, container_ref.current?.scrollHeight)
    }, [active_room, on_resize]);

    //let on_resize_throttled = useCallback(throttle(on_resize, 100), [on_resize]);

    // only use the resize observer to stick to the bottom on tiny changes
    const { ref: ul_ref } = useResizeDetector<HTMLDivElement>({
        onResize: useCallback((width, height) => {
            if(state.anchor == ScrollAnchor.Bottom) {
                //console.log("HEREERERERER");
                on_resize(width, height);
            }
        }, [on_resize]),
        observerOptions: { box: 'border-box' },
    });

    let load_messages = useCallback(throttle(() => {
        if(active_room && groups[0]) {
            dispatch(loadMessages(active_room, groups[0][0].msg.id, SearchMode.Before));
        }
    }, 500), [active_room, groups]);

    let on_scroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
        let t = event.currentTarget;
        if(!t) return;

        //__DEV__ && console.log("SCROLLED");

        let anchor = compute_at(t, window_height * 0.25, window_height * 0.25);

        if(anchor == ScrollAnchor.Top && state.anchor != ScrollAnchor.Top) {
            load_messages();
        }

        on_state({ pos: t.scrollTop, anchor });
    }, [load_messages, window_height, on_state]); // TODO: This will probably have dependencies

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
                <div className="ln-msg-list__wrapper__inner" ref={ul_ref}>
                    <ul className="ln-msg-list" id="ln-msg-list" >
                        {groups.map(group => <MessageGroup key={group[0].msg.id} group={group} is_light_theme={is_light_theme} />)}
                    </ul>
                </div>
            </div>
        </>
    );
})