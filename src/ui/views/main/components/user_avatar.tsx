import { pickColorFromHash } from 'lib/palette';
import React from 'react';

import { PresenceStatus, Snowflake, User } from 'state/models';

import { user_avatar_url } from 'config/urls';

import { Avatar } from 'ui/components/common/avatar';
import { VectorIcon } from 'ui/components/common/icon';

import { MobilePhoneIcon } from "ui/assets/icons";

export interface IUserAvatarProps {
    user: User,
    nickname: string,
    status: PresenceStatus,
    is_light_theme: boolean,
    is_mobile?: boolean,
}

import "./user_avatar.scss";
export const UserAvatar = React.memo(({ nickname, user, status, is_light_theme, is_mobile }: IUserAvatarProps) => {
    let url, backgroundColor, status_title, status_class;
    if(user.avatar) {
        url = user_avatar_url(user.id, user.avatar);
    } else {
        backgroundColor = pickColorFromHash(user.id, is_light_theme);
    }

    switch(status) {
        case PresenceStatus.Online: {
            status_title = "Online";
            status_class = "online";
            break;
        }
        case PresenceStatus.Busy: {
            status_title = "Busy/Do Not Disturb";
            status_class = "busy";
            break;
        }
        case PresenceStatus.Away: {
            status_title = "Away";
            status_class = "away";
            break;
        }
        default: {
            status_title = "Offline";
            status_class = "offline";
        }
    }

    let presence = (status == PresenceStatus.Online && is_mobile) ? <VectorIcon src={MobilePhoneIcon} /> : <span className={status_class} />;

    return (
        <div className="ln-user-avatar">
            <Avatar username={nickname} text={nickname.charAt(0)} url={url}
                backgroundColor={backgroundColor} />
            <div className="ln-user-status" title={status_title}>{presence}</div>
        </div>
    );
});

if(__DEV__) {
    UserAvatar.displayName = "UserAvatar";
}