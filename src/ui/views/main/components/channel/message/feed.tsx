import React, { useContext, useRef, useMemo, useState, useEffect, useCallback, useReducer, useLayoutEffect } from "react";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { createStructuredSelector } from 'reselect';

import { useResizeDetector } from "react-resize-detector/build/withPolyfill";

import dayjs from "lib/time";

import { Attachment, Snowflake, Message as MessageModel, Room, User, hasUserPrefFlag, UserPreferenceFlags } from "state/models";
import { RootState, Type } from "state/root";
import { loadMessages, SearchMode } from "state/commands";
import { IMessageState } from "state/reducers/chat";
import { Panel } from "state/reducers/window";
import { selectPrefsFlag } from "state/selectors/prefs";

import { message_attachment_url, user_avatar_url } from "config/urls";

import { pickColorFromHash } from "lib/palette";
import { IS_MOBILE } from "lib/user_agent";

import { useTitle } from "ui/hooks/useTitle";
import { Avatar } from "ui/components/common/avatar";
import { Message } from "./msg";
import { Timeline, ITimelineProps } from "./timeline";
import { AnchoredModal } from "ui/components/anchored_modal";
import { PositionedModal } from "ui/components/positioned_modal";
import { MsgContextMenu } from "../../menus/msg_context";
import { UserCard } from "../../menus/user_card";

import { useMainClick } from "ui/hooks/useMainClick";

export interface IMessageListProps {
    channel: Snowflake
}

const Attachment = React.memo(({ msg, attachment }: { msg: MessageModel, attachment: Attachment }) => {
    let [error, setError] = useState(false);

    let embed, mime = attachment.mime,
        url = message_attachment_url(msg.room_id, attachment.id, attachment.filename);

    if(mime && !error) {
        if(mime.startsWith('video')) {
            if(IS_MOBILE) {
                url += '#t=0.0001';
            }

            // TODO: Record playback position for moving into a modal and continuing playback?

            // the #t=0.0001 forces iOS Safari to preload the first frame and display that as a preview
            embed = <video preload="metadata" src={url} controls onError={() => setError(true)} />;
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
    children?: React.ReactNode,
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
        <h2 className="ln-msg__username ui-text" {...main_click_props}>
            {props.children}
            <AnchoredModal show={show}>
                <UserCard user={props.user} />
            </AnchoredModal>
            {props.name}
        </h2>
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

interface GroupMessageProps {
    msg: IMessageState,
    is_light_theme: boolean,
    nickname: string,
    first: boolean,
    compact: boolean,
}

const CompactMessageGroup = React.memo(({ msg, is_light_theme, nickname, first, compact }: GroupMessageProps) => {

    let message = <Message editing={false} msg={msg.msg} />;

    let side, ts = msg.ts.format("dddd, MMMM DD, h:mm A");

    side = (
        <div className="ln-msg__sidets" title={ts}>
            <span className="ui-text">{msg.ts.format('h:mm A')}</span>
        </div>
    );

    return (
        <>

            <div className="ln-msg--compact">
                <div className="ln-msg__title">
                    <div className="ln-msg__side">
                        {side}
                    </div>
                    <UserName name={nickname} user={msg.msg.author} />
                </div>
                {message}
            </div>
        </>
    );
});

const CozyMessageGroup = React.memo(({ msg, is_light_theme, nickname, first, compact }: GroupMessageProps) => {
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

        side = (<UserAvatar user={msg.msg.author} name={nickname} is_light_theme={is_light_theme} />);
    } else {
        side = (
            <div className="ln-msg__sidets" title={ts}>
                <span className="ui-text">{msg.ts.format('h:mm A')}</span>
            </div>
        );
    }

    return (
        <>
            <div className="ln-msg__side">
                {side}
            </div>
            {message}
        </>
    );
});

const GroupMessage = React.memo((props: GroupMessageProps) => {
    let attachments, msg = props.msg, a = msg.msg.attachments;
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

    let Inner = props.compact ? CompactMessageGroup : CozyMessageGroup;

    return (
        <div key={msg.msg.id} className={outer_class} {...main_click_props}>
            <div className="ln-msg__wrapper">
                <Inner {...props} />
                {cm}
            </div>
            {attachments}
        </div>
    );
});

interface MessageGroupProps {
    group: IMessageState[],
    is_light_theme: boolean,
    compact: boolean,
}

// NOTE: Because `group` is recomputed below as part of `groups`, this will always render.
const MessageGroup = ({ group, is_light_theme, compact }: MessageGroupProps) => {
    let { msg } = group[0];
    let nickname = msg.member?.nick || msg.author.username;

    return (
        <li className="ln-msg-list__group">
            {group.map((msg, i) => <GroupMessage key={msg.msg.id} msg={msg} nickname={nickname} is_light_theme={is_light_theme} first={i == 0} compact={compact} />)}
        </li>
    );
};

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
            <MessageFeedInner room={!!room} groups={groups} />
        </div>
    );
});

const MsgList = React.memo(({ groups, is_light_theme, compact }: { groups: IMessageState[][], is_light_theme: boolean, compact: boolean }) => {
    return (
        <ul className="ln-msg-list" id="ln-msg-list" >
            {groups.map(group => <MessageGroup key={group[0].msg.id} group={group} is_light_theme={is_light_theme} compact={compact} />)}
        </ul>
    );
});

const NoTimeline = React.memo(() => <></>);

interface IMessageFeedInnerProps {
    room: boolean,
    groups: Array<IMessageState[]>,
}

const inner_feed_selector = createStructuredSelector({
    active_room: (state: RootState) => state.chat.active_room,
    use_mobile_view: (state: RootState) => state.window.use_mobile_view,
    is_light_theme: selectPrefsFlag(UserPreferenceFlags.LightMode),
    compact: selectPrefsFlag(UserPreferenceFlags.CompactView),
    gl: selectPrefsFlag(UserPreferenceFlags.GroupLines),
});

import { Anchor, InfiniteScroll } from "ui/components/infinite_scroll";

const MessageFeedInner = React.memo(({ room, groups }: IMessageFeedInnerProps) => {
    let { active_room, use_mobile_view, is_light_theme, compact, gl } = useSelector(inner_feed_selector);
    let dispatch = useDispatch();

    let load_next = useCallback(() => { }, []);
    let load_prev = useCallback(() => {
        if(active_room && groups[0]) {
            dispatch(loadMessages(active_room, groups[0][0].msg.id, SearchMode.Before));
        }
    }, [groups, active_room]);

    if(!room) {
        return <div className="ln-center-standalone">Channel does not exist</div>;
    }

    let wrapperClasses = '',
        MaybeTimeline: React.FunctionComponent<ITimelineProps> = Timeline;

    if(use_mobile_view) {
        MaybeTimeline = NoTimeline;
    } else {
        wrapperClasses = 'has-timeline';
    }

    if(compact) {
        wrapperClasses += ' compact';
    }

    if(gl) {
        wrapperClasses += ' group-lines';
    }

    return (
        <>
            <MaybeTimeline direction={0} position={0} />
            <InfiniteScroll start={Anchor.Bottom}
                load_next={load_next} load_prev={load_prev}
                reset_on_changed={active_room}
                containerClassName={wrapperClasses}
            >
                <MsgList groups={groups} is_light_theme={is_light_theme} compact={compact} />
            </InfiniteScroll>
        </>
    )
});

