import { pickColorFromHash } from 'lib/palette';
import React from 'react';

import { Snowflake, User } from 'state/models';

import { user_avatar_url } from 'config/urls';

import { Avatar } from 'ui/components/common/avatar';
import { Glyphicon } from 'ui/components/common/glyphicon';

import MobilePhone from "icons/glyphicons-pro/glyphicons-halflings-2-3/svg/individual-svg/glyphicons-halflings-91-mobile-phone.svg";

export interface IUserAvatarProps {
    user: User,
    nickname: string,
    status: 'online' | 'away' | 'busy' | 'offline',
    is_light_theme: boolean,
    is_mobile?: boolean,
}

import "./user_avatar.scss";
export const UserAvatar = React.memo(({ nickname, user, status, is_light_theme, is_mobile }: IUserAvatarProps) => {
    let presence = (status == 'online' && is_mobile) ? <Glyphicon src={MobilePhone} /> : <span className={status} />;

    let url, backgroundColor, status_title;
    if(user.avatar) {
        url = user_avatar_url(user.id, user.avatar);
    } else {
        backgroundColor = pickColorFromHash(user.id, is_light_theme);
    }

    switch(status) {
        case 'online': status_title = "Online"; break;
        case 'busy': status_title = "Busy/Do Not Disturb"; break;
        case 'away': status_title = "Away"; break;
        default: status_title = "Offline";
    }

    return (
        <div className="ln-user-avatar">
            <Avatar username={nickname} text={nickname.charAt(0)} url={url}
                backgroundColor={backgroundColor} />
            <div className="ln-user-status" title={status_title}>{presence}</div>
        </div>
    )
});