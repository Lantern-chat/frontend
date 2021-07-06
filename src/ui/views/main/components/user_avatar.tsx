import { pickColorFromHash } from 'lib/palette';
import React from 'react';
import { Snowflake, User } from 'state/models';

import { Avatar } from 'ui/components/common/avatar';

export interface IUserAvatarProps {
    user: User,
    nickname: string,
    status: 'online' | 'away' | 'busy' | 'offline',
    is_light_theme: boolean,
}

import "./user_avatar.scss";
export const UserAvatar = React.memo(({ nickname, user, status, is_light_theme }: IUserAvatarProps) => {
    return (
        <div className="ln-user-avatar">
            <Avatar username={nickname} text={nickname.charAt(0)}
                backgroundColor={pickColorFromHash(user.id, is_light_theme)} />
            <div className="ln-user-status"><span className={status} /></div>
        </div>
    )
})