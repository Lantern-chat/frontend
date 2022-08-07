import { Accessor, createMemo, Show } from 'solid-js';
import { useI18nContext } from 'ui/i18n/i18n-solid';

import { pickColorFromHash } from 'lib/palette';
import { formatRgbBinary } from 'lib/color';

import { parse_presence, PresenceStatus, Snowflake, User, UserPresence, UserProfile } from 'state/models';

import { asset_url } from 'config/urls';
import { usePrefs } from 'state/contexts/prefs';

import { Avatar } from 'ui/components/common/avatar';
import { VectorIcon } from 'ui/components/common/icon';

import { Icons } from "lantern-icons";

export interface IUserAvatarProps {
    user_id: Snowflake,
    profile: UserProfile | null | undefined,
    nickname: string,

    presence: UserPresence | null | undefined,

    roundness?: number,

    /// Override the avatar URL
    url?: string | null,
}

import "./user_avatar.scss";
export function UserAvatar(props: IUserAvatarProps) {
    const { LL } = useI18nContext();

    const prefs = usePrefs();

    let presence = createMemo(() => props.presence ? parse_presence(props.presence) : {
        is_mobile: false,
        status: PresenceStatus.Offline,
    });

    let url_or_color = createMemo(() => {
        let url = props.url, backgroundColor, profile = props.profile;;

        if(!url) {
            if(props.profile?.avatar) {
                url = asset_url('user', props.user_id, props.profile.avatar, 'avatar', prefs.LowBandwidthMode());
            } else {
                backgroundColor = (profile && (profile.bits & (1 << 7))) ? formatRgbBinary(profile.bits >> 8) : 'black';
            }
        }

        return { url, backgroundColor };
    });

    let status = createMemo(() => {
        switch(presence().status) {
            case PresenceStatus.Online: return [LL().main.ONLINE(), "online"];
            case PresenceStatus.Busy: return [LL().main.BUSY(), "busy"];
            case PresenceStatus.Away: return [LL().main.AWAY(), "away"];
            default: return [LL().main.OFFLINE(), "offline"];
        }
    });

    return (
        <div class="ln-user-avatar">
            <Avatar username={props.nickname} text={props.nickname.charAt(0)} url={url_or_color().url} backgroundColor={url_or_color().backgroundColor} rounded={props.roundness} />

            <div class="ln-user-status" title={status()[0]}>
                <Show
                    fallback={<span class={status()[1]} />}
                    when={presence().status == PresenceStatus.Online && presence().is_mobile}
                >
                    <VectorIcon id={Icons.MobilePhone} />
                </Show>
            </div>
        </div>
    );
}