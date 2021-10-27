import React, { useState } from "react";
import classNames from "classnames";

import { User } from "state/models";
import { IMessageState } from "state/reducers/chat";

import { user_avatar_url } from "config/urls";

import { pickColorFromHash } from "lib/palette";

import { Avatar } from "ui/components/common/avatar";
import { Message } from "../message/msg";
import { MsgAttachment } from "../message/attachment";
import { AnchoredModal } from "ui/components/anchored_modal";
import { PositionedModal } from "ui/components/positioned_modal";
import { MsgContextMenu } from "../../menus/msg_context";
import { UserCard } from "../../menus/user_card";

import { useMainClick, useSimpleToggleOnClick } from "ui/hooks/useMainClick";

interface IUserNameProps {
    name: string,
    user: User,
    is_light_theme?: boolean,
    children?: React.ReactNode,
}

const UserName = React.memo((props: IUserNameProps) => {
    let [show, main_click_props] = useSimpleToggleOnClick();

    return (
        <h2 className="ln-msg__username ui-text" {...main_click_props}>
            {props.children}
            <AnchoredModal show={show}>
                <UserCard user={props.user} />
            </AnchoredModal>
            {props.name}
        </h2>
    );
});

const UserAvatar = React.memo(({ name, user, is_light_theme }: IUserNameProps) => {
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

interface GroupMessageProps {
    msg: IMessageState,
    is_light_theme: boolean,
    nickname: string,
    first: boolean,
    compact: boolean,
}

const CompactMessageGroup = React.memo(({ msg, is_light_theme, nickname, first }: GroupMessageProps) => {
    let ts = msg.ts.format("dddd, MMMM DD, h:mm A");

    return (
        <div className="ln-msg--compact">
            <div className="ln-msg__title">
                <div className="ln-msg__side">
                    <div className="ln-msg__sidets" title={ts}>
                        <span className="ui-text">{msg.ts.format('h:mm A')}</span>
                    </div>
                </div>

                <UserName name={nickname} user={msg.msg.author} />
            </div>

            <Message editing={false} msg={msg.msg} />
        </div>
    );
});

const CozyMessageGroup = React.memo(({ msg, is_light_theme, nickname, first }: GroupMessageProps) => {
    let message = <Message editing={false} msg={msg.msg} />;

    let side, ts = msg.ts.format("dddd, MMMM DD, h:mm A");

    // if first message in the group, give it the user avatar and title
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
        attachments = a.map(attachment => <MsgAttachment key={attachment.id} msg={msg.msg} attachment={attachment} />)
    }

    let [pos, setPos] = useState<{ top: number, left: number } | null>(null),
        [warn, setWarn] = useState(false);

    let cm;
    if(pos) {
        cm = (
            <PositionedModal top={pos.top} left={pos.left}>
                <MsgContextMenu msg={msg} pos={pos} onConfirmChange={(pending: boolean) => setWarn(pending)} />
            </PositionedModal>
        );
    }

    // TODO: Use one of the simpler hooks?
    let main_click_props = useMainClick({
        active: !!pos,
        onMainClick: () => { setPos(null); setWarn(false); },
        onContextMenu: (e: React.MouseEvent) => {
            setPos({ top: e.clientY, left: e.clientX });
            e.stopPropagation();
            e.preventDefault();
        },
    }, []);

    let outer_class = classNames("ln-msg__outer", {
        "highlighted": cm,
        "warning": cm && warn,
    });

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
export const MessageGroup = ({ group, is_light_theme, compact }: MessageGroupProps) => {
    let { msg } = group[0];
    let nickname = msg.member?.nick || msg.author.username;

    return (
        <li className="ln-msg-list__group">
            {group.map((msg, i) => <GroupMessage key={msg.msg.id} msg={msg} nickname={nickname} is_light_theme={is_light_theme} first={i == 0} compact={compact} />)}
        </li>
    );
};