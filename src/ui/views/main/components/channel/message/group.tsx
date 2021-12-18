import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import classNames from "classnames";

import { MessageFlags, User, user_is_bot, user_is_system } from "state/models";
import { IMessageState } from "state/reducers/chat";

import { user_avatar_url } from "config/urls";

import { pickColorFromHash } from "lib/palette";

import { Avatar } from "ui/components/common/avatar";
import { Message } from "../message/msg";
import { MsgAttachment } from "../message/attachment";
import { AnchoredModal } from "ui/components/modal/anchored_modal";
import { PositionedModal } from "ui/components/modal/positioned_modal";
import { MsgContextMenu } from "../../menus/msg_context";
import { UserCard } from "../../menus/user_card";
import { BotLabel } from "../../misc/bot_label";

import { useSimplePositionedContextMenu, useSimpleToggleOnClick } from "ui/hooks/useMainClick";
import { useSelector } from "react-redux";
import { RootState } from "state/root";
import { activeParty } from "state/selectors/active";
import { selectCachedUser } from "state/selectors/selectCachedUser";

interface IUserNameProps {
    name: string,
    user: User,
    is_light_theme?: boolean,
}

const MessageUserName = React.memo((props: IUserNameProps) => {
    let user = props.user,
        [show, main_click_props] = useSimpleToggleOnClick();

    let color = useSelector((state: RootState) => {
        let party_id = activeParty(state);
        if(!party_id) return;

        let party = state.party.parties.get(party_id);
        if(!party) return;

        return party.member_colors.get(user.id);
    });

    return (
        <h2 className="ln-msg__username" {...main_click_props} style={{ color }}>
            <AnchoredModal show={show}>
                <UserCard user={user} />
            </AnchoredModal>

            <span className="ui-text">{props.name}</span>
        </h2>
    );
});

const MessageUserAvatar = React.memo(({ name, user, is_light_theme }: Omit<IUserNameProps, 'msg'>) => {
    let [show, main_click_props] = useSimpleToggleOnClick();

    let avatar_url;
    if(user.avatar) {
        avatar_url = user_avatar_url(user.id, user.avatar);
    }

    return (
        <Avatar
            username={name}
            text={name.charAt(0)}
            url={avatar_url}
            backgroundColor={pickColorFromHash(user.id, !!is_light_theme)}
            props={main_click_props}
            anchor={
                <AnchoredModal show={show}>
                    <UserCard user={user} />
                </AnchoredModal>
            }
        />
    )
});

import PencilIcon from "icons/glyphicons-pro/glyphicons-halflings-2-3/svg/individual-svg/glyphicons-halflings-13-pencil.svg";
import PushPinIcon from "icons/glyphicons-pro/glyphicons-halflings-2-3/svg/individual-svg/glyphicons-halflings-201-push-pin.svg";

interface IGroupMessageProps {
    msg: IMessageState,
    is_light_theme: boolean,
    first: boolean,
    compact: boolean,
    attachments?: React.ReactNode,
}

/// Group Message for the Cozy view mode
const CozyGroupMessage = React.memo(({ msg, is_light_theme, first, attachments }: IGroupMessageProps) => {
    let side, title,
        ts = msg.ts.format("dddd, MMMM DD, h:mm A"),
        raw = msg.msg,
        cached_member = useSelector((state: RootState) => {
            return selectCachedUser(state, raw.author.id, raw.party_id) || { user: raw.author, nick: raw.member?.nick };
        }),
        nickname = cached_member.nick || cached_member.user.username,
        message = <Message editing={false} msg={raw} />,
        edited_ts = msg.et?.format("dddd, MMMM DD, h:mm A");

    // if first message in the group, give it the user avatar and title
    if(first) {
        let bot;
        if(user_is_bot(raw.author)) {
            bot = <BotLabel />;
        }

        let edited, pinned;
        if(msg.et) {
            edited = (
                <span className="flags" title={"Edited " + edited_ts}>
                    <Glyphicon src={PencilIcon} />
                </span>
            );
        }

        if(raw.flags & MessageFlags.Pinned) {
            pinned = (
                <span className="flags" title="Message Pinned">
                    <Glyphicon src={PushPinIcon} />
                </span>
            );
        }

        title = (
            <div className="ln-msg__title">
                <MessageUserName name={nickname} user={raw.author} />

                <span className="ln-separator"> - </span>

                <span className="ln-msg__ts" title={ts}>
                    <span className="ui-text">{msg.ts.calendar()}</span>
                    {edited}
                    {pinned}
                </span>

                {bot}
            </div>
        );

        side = (<MessageUserAvatar user={cached_member.user} name={nickname} is_light_theme={is_light_theme} />);
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

            <div className="ln-msg__message">
                {title}
                {message}
                {attachments}
            </div>
        </>
    );
});

/// Group Message for the Compact view mode
const CompactGroupMessage = React.memo(({ msg, is_light_theme, first, attachments }: IGroupMessageProps) => {
    let ts = msg.ts.format("dddd, MMMM DD, h:mm A"),
        raw = msg.msg,
        cached_member = useSelector((state: RootState) => {
            return selectCachedUser(state, raw.author.id, raw.party_id) || { user: raw.author, nick: raw.member?.nick };
        }),
        nickname = cached_member.nick || cached_member.user.username;

    let className = classNames("ln-msg--compact", {
        'no-text': raw.content.length == 0,
    });

    return (
        <div className={className}>
            <div className="ln-msg__title">
                <div className="ln-msg__side">
                    <div className="ln-msg__sidets" title={ts}>
                        <span className="ui-text">{msg.ts.format('h:mm A')}</span>
                    </div>
                </div>

                <MessageUserName name={nickname} user={raw.author} />
            </div>

            <Message editing={false} msg={raw} />

            {attachments}
        </div>
    );
});

import ArrowThinRight from "icons/glyphicons-pro/glyphicons-halflings-2-3/svg/individual-svg/glyphicons-halflings-216-arrow-thin-right.svg";
import { Glyphicon } from "ui/components/common/glyphicon";
import { compareString } from "lib/compare";
import { useSorted } from "ui/hooks/useSorted";

const SystemMessage = React.memo((props: IGroupMessageProps) => {
    let msg = props.msg, raw = msg.msg;
    return (
        <>
            <div className="ln-msg__side ln-system-message">
                <Glyphicon src={ArrowThinRight} />
            </div>
            <div className="ln-msg__message ln-system-message">
                <Message editing={false} msg={raw} extra={` <sub>${msg.ts.calendar()}</sub>`} />
            </div>
        </>
    );
});

const GroupMessage = React.memo((props: IGroupMessageProps) => {
    let attachments, msg = props.msg, raw = msg.msg,
        a = useSorted(raw.attachments || [], (a, b) => compareString(a.id, b.id), [raw.attachments]);

    if(a && a.length) {
        attachments = a.map(attachment => <MsgAttachment key={attachment.id} msg={raw} attachment={attachment} />)
    }

    let cm, [warn, setWarn] = useState(false),
        [pos, main_click_props] = useSimplePositionedContextMenu({
            onMainClick: () => setWarn(false),
        });

    if(pos) {
        cm = (
            <PositionedModal top={pos.top} left={pos.left}>
                <MsgContextMenu msg={msg} pos={pos} onConfirmChange={(pending: boolean) => setWarn(pending)} />
            </PositionedModal>
        );
    }

    // select inner message component based on style.
    // The identifier must be Proper-case to be used as a Component below.
    let Inner;
    if(user_is_system(raw.author)) {
        Inner = SystemMessage;
    } else {
        Inner = props.compact ? CompactGroupMessage : CozyGroupMessage;
    }

    let outer_class = classNames("ln-msg__outer", {
        "highlighted": cm,
        "warning": cm && warn,
    });

    return (
        <div key={raw.id} id={raw.id} className={outer_class} {...main_click_props}>
            <div className="ln-msg__wrapper">
                <Inner {...props} attachments={attachments} />
                {cm}
            </div>
        </div>
    );
});

interface IMessageGroupProps {
    group: IMessageState[],
    is_light_theme: boolean,
    compact: boolean,
}

export const MessageGroup: React.FunctionComponent<IMessageGroupProps> = ({ group, is_light_theme, compact }: IMessageGroupProps) => {
    // NOTE: Because `group` is recomputed below as part of `groups`, this will always render.

    return (
        <li className="ln-msg-list__group">
            {group.map((msg, i) => <GroupMessage key={msg.msg.id} msg={msg} is_light_theme={is_light_theme} first={i == 0} compact={compact} />)}
        </li>
    );
};

/*
import { InfiniteScrollContext } from "ui/components/infinite_scroll2";
import { useForceRender } from "ui/hooks/useForceRender";

import throttle from 'lodash/throttle';

export const MessageGroup2: React.FunctionComponent<IMessageGroupProps> = ({ group, is_light_theme, compact }: IMessageGroupProps) => {
    // NOTE: Because `group` is recomputed below as part of `groups`, this will always render.

    let height = useRef<number | null>(null),
        forceRender = useForceRender(),
        ifs = useContext(InfiniteScrollContext),
        group_ref = useRef<HTMLLIElement>(null);

    useEffect(() => {
        let g = group_ref.current;
        if(ifs && g) {
            let observer = new IntersectionObserver(throttle((entries) => {
                let r = entries[0].intersectionRatio;

                if(!g) return;

                if(r <= 0 && height.current == null) {
                    // gone out of view

                    let rect = g.getBoundingClientRect();
                    let inner_scroll_height = g.clientHeight - (g.scrollHeight + (Math.floor(rect.height) - rect.height)) + g.scrollHeight

                    height.current = inner_scroll_height;
                    forceRender();
                } else if(r > 0 && height.current != null) {
                    // come into view
                    height.current = null;
                    forceRender();
                }
            }, 20, { trailing: true }), { root: ifs.containerRef.current, rootMargin: '50%' });

            observer.observe(g);
            return () => { observer.disconnect(); };
        }
        return;
    }, [group_ref.current, ifs]);

    let inner;
    if(height.current == null) {
        inner = group.map((msg, i) => <GroupMessage key={msg.msg.id} msg={msg} is_light_theme={is_light_theme} first={i == 0} compact={compact} />);
    } else {
        inner = <div style={{ height: height.current, padding: 0, margin: 0, border: 'none', outline: 'none' }} />;
    }

    return (<li className="ln-msg-list__group" ref={group_ref}>{inner}</li>);
};
*/


if(__DEV__) {
    MessageGroup.displayName = "MessageGroup";
    GroupMessage.displayName = "GroupMessage";
    CompactGroupMessage.displayName = "CompactGroupMessage";
    CozyGroupMessage.displayName = "CozyGroupMessage";
    MessageUserName.displayName = "MessageUserName";
    MessageUserAvatar.displayName = "MessageUserAvatar";
}