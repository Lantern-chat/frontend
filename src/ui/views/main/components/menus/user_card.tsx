import { createEffect, createMemo, onMount, Show } from "solid-js";
import { useStructuredSelector } from "solid-mutant";
import { PartyMember, Snowflake, User, parse_presence, UserPreferenceFlags, user_is_bot, PresenceStatus, UserProfile, split_profile_bits, UserPresence, UserProfileSplitBits } from "state/models";
import { RootState, useRootDispatch, useRootSelector, useRootStore } from "state/root";
import { selectCachedUser } from "state/selectors/selectCachedUser";
import { useI18nContext } from "ui/i18n/i18n-solid";
import { usePrefs } from "state/contexts/prefs";
import { pickColorFromHash } from "lib/palette";
import { Markdown } from "ui/components/common/markdown";
import { Branch } from "ui/components/flow";
import { UserAvatar } from "../user_avatar";
import { BotLabel } from "../misc/bot_label";
import { asset_url } from "config/urls";
import { formatRgbBinary } from "lib/color";
import { fetch_profile } from "state/commands/profile";
import { CachedUser } from "state/mutators/cache";
import { Discriminator } from "../misc/discriminator";

export interface IUserCardProps {
    user_id: Snowflake,
    party_id?: Snowflake,
}

import "./list.scss";
import "./user_card.scss";
export function UserCard(props: IUserCardProps) {
    let store = useRootStore();

    onMount(() => store.dispatch(fetch_profile(props.user_id, props.party_id)));

    let cached_user = createMemo(() => selectCachedUser(store.state, props.user_id, props.party_id));

    return (
        <Show when={cached_user()} fallback={<span class="ui-text">User Not Found</span>}>
            {cached_user => (
                <SimpleUserCard
                    user={cached_user.user}
                    nick={cached_user.nick}
                    bits={cached_user.bits}
                    profile={cached_user.profile}
                    presence={cached_user.presence} />
            )}
        </Show>
    );
}

export interface ISimpleUserCardProps {
    user: User,
    nick: string | undefined,
    presence?: UserPresence,
    profile: UserProfile | undefined | null,
    bits?: UserProfileSplitBits,
    banner_url?: string,
    avatar_url?: string,
}

// NOTE: USED IN DIRECTIVE BELOW
import { eat } from "ui/hooks/useEater";
false && eat;

export function SimpleUserCard(props: ISimpleUserCardProps) {
    let prefs = usePrefs();
    const { LL } = useI18nContext();

    let bits = createMemo(() => props.bits || (props.profile && split_profile_bits(props.profile)));

    let banner_url = () => {
        if(props.banner_url) return props.banner_url;
        let banner = props.profile?.banner;
        return banner && asset_url('user', props.user.id, banner, 'banner', prefs.LowBandwidthMode());
    };
    let avatar_url = () => {
        if(props.avatar_url) return props.avatar_url;
        let avatar = props.profile?.avatar;
        return avatar && asset_url('user', props.user.id, avatar, 'avatar', prefs.LowBandwidthMode());
    };
    let color = () => {
        let b = bits();
        return !b?.override_color ? pickColorFromHash(props.user.id, prefs.LightMode())
            : formatRgbBinary(b.color);
    };

    return (
        <div class="ln-user-card ln-contextmenu" use:eat={["click", "contextmenu"]}
            classList={{ 'has-banner': !!banner_url(), 'has-avatar': !!avatar_url() }}
        >
            <div class="ln-user-card__header">
                <div class="banner"
                    style={{ "background-color": color() }}>
                    <Show when={banner_url()}>
                        {banner => <img src={banner} />}
                    </Show>
                </div>
                <div class="avatar-box" style={{ 'border-radius': ((bits()?.roundedness || 0) * 50 + '%') }}>
                    <UserAvatar nickname={props.nick || props.user.username}
                        user_id={props.user.id}
                        profile={props.profile}
                        url={avatar_url()}
                        color={color}
                        roundness={bits()?.roundedness}
                        presence={props.presence}
                    />
                </div>
            </div>

            <div class="ln-user-card__info">
                <div class="ui-text ln-username">
                    <Branch>
                        <Branch.If when={props.nick}>
                            <h4>{props.nick}</h4>
                            <span>{props.user.username}<Discriminator discriminator={props.user.discriminator} /></span>
                        </Branch.If>
                        <Branch.Else>
                            <h4>{props.user.username}<Discriminator discriminator={props.user.discriminator} /></h4>
                        </Branch.Else>
                    </Branch>
                    <Show when={user_is_bot(props.user)}>
                        <BotLabel />
                    </Show>
                </div>

                <Show when={props.user.profile?.status}>
                    {status => <div class="ln-user-custom-status" textContent={status} />}
                </Show>

                <Show when={props.user.profile?.bio}>
                    {bio => (
                        <>
                            <hr />
                            <div class="ln-user-biography">
                                <span class="ln-user-biography__title">ABOUT ME</span>

                                <Markdown source={bio} />
                            </div>
                        </>
                    )}
                </Show>
            </div>
        </div>
    )
}