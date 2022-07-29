import { createMemo, Show } from 'solid-js';
import { useI18nContext } from 'ui/i18n/i18n-solid';

import { pickColorFromHash } from 'lib/palette';

import { PresenceStatus, Snowflake, User } from 'state/models';

import { user_avatar_url, asset_url } from 'config/urls';
import { usePrefs } from 'state/contexts/prefs';

import { Avatar } from 'ui/components/common/avatar';
import { VectorIcon } from 'ui/components/common/icon';

import { Icons } from "lantern-icons";

export interface IUserAvatarProps {
    user: User,
    nickname: string,
    status: PresenceStatus,
    is_mobile?: boolean,
}

import "./user_avatar.scss";
export function UserAvatar(props: IUserAvatarProps) {
    const { LL } = useI18nContext();

    let url_or_color = createMemo(() => {
        let url, backgroundColor, user = props.user;

        if(user.profile?.avatar) {
            url = asset_url('user', user.id, user.profile.avatar, 'avatar');
        } else {
            backgroundColor = pickColorFromHash(user.id, usePrefs().LightMode());
        }

        return { url, backgroundColor };
    });

    let status = createMemo(() => {
        switch(props.status) {
            case PresenceStatus.Online: return [LL().main.ONLINE(), "online"];
            case PresenceStatus.Busy: return [LL().main.BUSY(), "busy"];
            case PresenceStatus.Away: return [LL().main.AWAY(), "away"];
            default: return [LL().main.OFFLINE(), "offline"];
        }
    });

    return (
        <div class="ln-user-avatar">
            <Avatar username={props.nickname} text={props.nickname.charAt(0)} {...url_or_color()} />

            <div class="ln-user-status" title={status()[0]}>
                <Show
                    fallback={<span class={status()[1]} />}
                    when={props.status == PresenceStatus.Online && props.is_mobile}
                >
                    <VectorIcon id={Icons.MobilePhone} />
                </Show>
            </div>
        </div>
    );
}