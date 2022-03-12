import { pickColorFromHash } from 'lib/palette';

import { PresenceStatus, Snowflake, User } from 'state/models';

import { user_avatar_url } from 'config/urls';

import { Avatar } from 'ui/components/common/avatar';
import { VectorIcon } from 'ui/components/common/icon';

import { MobilePhoneIcon } from "lantern-icons";

export interface IUserAvatarProps {
    user: User,
    nickname: string,
    status: PresenceStatus,
    is_light_theme: boolean,
    is_mobile?: boolean,
}

import "./user_avatar.scss";
import { createMemo, Show } from 'solid-js';

export function UserAvatar(props: IUserAvatarProps) {
    let url_or_color = createMemo(() => {
        let url, backgroundColor, user = props.user;

        if(user.avatar) {
            url = user_avatar_url(user.id, user.avatar);
        } else {
            backgroundColor = pickColorFromHash(user.id, props.is_light_theme);
        }

        return { url, backgroundColor };
    });

    let status = createMemo(() => {
        switch(props.status) {
            case PresenceStatus.Online: return ["Online", "online"];
            case PresenceStatus.Busy: return ["Busy/Do Not Disturb", "busy"];
            case PresenceStatus.Away: return ["Away", "away"];
            default: return ["Offline", "offline"];
        }
    });

    return (
        <div className="ln-user-avatar">
            <Avatar username={props.nickname} text={props.nickname.charAt(0)} {...url_or_color()} />

            <div className="ln-user-status" title={status()[0]}>
                <Show
                    fallback={<span className={status()[1]} />}
                    when={props.status == PresenceStatus.Online && props.is_mobile}
                >
                    <VectorIcon src={MobilePhoneIcon} />
                </Show>
            </div>
        </div>
    );
}