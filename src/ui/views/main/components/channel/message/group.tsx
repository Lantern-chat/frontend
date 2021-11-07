import React, { useMemo, useState } from "react";
import classNames from "classnames";

import { User } from "state/models";
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

import { useSimplePositionedContextMenu, useSimpleToggleOnClick } from "ui/hooks/useMainClick";
import { useSelector } from "react-redux";
import { RootState } from "state/root";
import { activeParty } from "state/selectors/active";
import { selectCachedUser } from "state/selectors/selectCachedUser";

interface IUserNameProps {
    name: string,
    msg: IMessageState,
    user: User,
    is_light_theme?: boolean,
}

const MessageUserName = React.memo((props: IUserNameProps) => {
    let [show, main_click_props] = useSimpleToggleOnClick();

    let author = props.msg.msg.author;

    let color = useSelector((state: RootState) => {
        let party_id = activeParty(state);
        if(!party_id) return;

        let party = state.party.parties.get(party_id);
        if(!party) return;

        return party.member_colors.get(author.id);
    });

    return (
        <h2 className="ln-msg__username" {...main_click_props}>
            <AnchoredModal show={show}>
                <UserCard user={props.user} />
            </AnchoredModal>

            <span className="ui-text" style={{ color }}>{props.name}</span>
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

interface IGroupMessageProps {
    msg: IMessageState,
    is_light_theme: boolean,
    first: boolean,
    compact: boolean,
    attachments?: React.ReactNode,
}

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

                <MessageUserName name={nickname} user={raw.author} msg={msg} />
            </div>

            <Message editing={false} msg={raw} />

            {attachments}
        </div>
    );
});

/// Group Message for the Cozy view mode
const CozyGroupMessage = React.memo(({ msg, is_light_theme, first, attachments }: IGroupMessageProps) => {
    let side, title,
        ts = msg.ts.format("dddd, MMMM DD, h:mm A"),
        raw = msg.msg,
        cached_member = useSelector((state: RootState) => {
            return selectCachedUser(state, raw.author.id, raw.party_id) || { user: raw.author, nick: raw.member?.nick };
        }),
        nickname = cached_member.nick || cached_member.user.username,
        message = <Message editing={false} msg={raw} />;

    // if first message in the group, give it the user avatar and title
    if(first) {
        title = (
            <div className="ln-msg__title">
                <MessageUserName name={nickname} user={raw.author} msg={msg} />

                <span className="ln-separator"> - </span>

                <span className="ln-msg__ts" title={ts}>
                    <span className="ui-text">{msg.ts.calendar()}</span>
                </span>
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

const GroupMessage = React.memo((props: IGroupMessageProps) => {
    let attachments, msg = props.msg, raw = msg.msg, a = raw.attachments;

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
    let Inner = props.compact ? CompactGroupMessage : CozyGroupMessage;

    let outer_class = classNames("ln-msg__outer", {
        "highlighted": cm,
        "warning": cm && warn,
    });

    return (
        <div key={raw.id} className={outer_class} {...main_click_props}>
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

if(__DEV__) {
    MessageGroup.displayName = "MessageGroup";
    GroupMessage.displayName = "GroupMessage";
    CompactGroupMessage.displayName = "CompactGroupMessage";
    CozyGroupMessage.displayName = "CozyGroupMessage";
    MessageUserName.displayName = "MessageUserName";
    MessageUserAvatar.displayName = "MessageUserAvatar";
}