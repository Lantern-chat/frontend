import { createEffect, createMemo, JSXElement, onMount, Show } from "solid-js";
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
import { formatRgbBinary, formatRGBHex, hsv2rgb, HSVColor, RGBColor } from "lib/color";
import { fetch_profile } from "state/commands/profile";
import { CachedUser } from "state/mutators/cache";
import { Discriminator } from "../misc/discriminator";
import { br } from "ui/utils";

export interface IUserCardProps {
    user_id: Snowflake,
    party_id?: Snowflake,
}

import "./list.scss";
import "./user_card.scss";
export function UserCard(props: IUserCardProps) {
    let store = useRootStore();

    let cached_user = createMemo(() => selectCachedUser(store.state, props.user_id, props.party_id));

    onMount(() => {
        if(cached_user().profile) {
            store.dispatch(fetch_profile(props.user_id, props.party_id));
        }
    });

    return (
        <Show when={cached_user()} fallback={<span class="ui-text">User Not Found</span>}>
            <SimpleUserCard
                user={cached_user()!.user}
                nick={cached_user()!.nick}
                bits={cached_user()!.bits}
                profile={cached_user()!.profile}
                presence={cached_user()!.presence} />
        </Show>
    );
}

export interface ISimpleUserCardProps {
    user: User,
    nick: string | undefined,
    presence?: UserPresence,
    profile: UserProfile | undefined | null,
    bits?: UserProfileSplitBits,
    banner_url?: string | null,
    avatar_url?: string | null,

    avatarCover?: JSXElement,
    bannerCover?: JSXElement,
    hideBanner?: boolean,
    statusExt?: JSXElement,
    bioExt?: JSXElement,
    color?: RGBColor,
    roundness?: number,
}

export function SimpleUserCard(props: ISimpleUserCardProps) {
    let prefs = usePrefs();
    const { LL } = useI18nContext();

    let bits = createMemo(() => props.bits || (props.profile && split_profile_bits(props.profile)));

    let banner_url = () => {
        let banner, url = props.banner_url;
        if(url === undefined && (banner = props.profile?.banner)) {
            url = asset_url('user', props.user.id, banner, 'banner', prefs.LowBandwidthMode());
        }
        return url && `url("${url}")`;
    };
    let avatar_url = () => {
        if(props.avatar_url !== undefined) return props.avatar_url;
        let avatar = props.profile?.avatar;
        return avatar && asset_url('user', props.user.id, avatar, 'avatar', prefs.LowBandwidthMode());
    };
    let color = () => {
        if(props.color) {
            return formatRGBHex(props.color);
        }

        let b = bits();
        return !b?.override_color ? pickColorFromHash(props.user.id, prefs.LightMode())
            : formatRgbBinary(b.color);
    };
    let roundness = () => props.roundness ?? (bits()?.roundedness || 0);

    return (
        <div class="ln-user-card ln-contextmenu"
            classList={{ 'has-banner': !!banner_url(), 'has-avatar': !!avatar_url() }}
        >
            <div class="ln-user-card__header">
                <div class="banner"
                    style={{
                        "background-color": color(),
                        'background-image': props.hideBanner ? null : banner_url(),
                    }}
                >
                    {props.bannerCover}
                </div>

                <div class="avatar-box" style={{ 'border-radius': br(roundness()) }}>
                    <UserAvatar nickname={props.nick || props.user.username}
                        user_id={props.user.id}
                        profile={props.profile}
                        url={avatar_url()}
                        roundness={roundness()}
                        presence={props.presence}
                        cover={props.avatarCover}
                        color={color()}
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

                <Show when={props.profile?.status}>
                    <div class="ln-user-custom-status">
                        <span class="chat-text" textContent={props.profile!.status!} />

                        {props.statusExt}
                    </div>
                </Show>

                <Show when={props.profile?.bio}>
                    <hr />
                    <div class="ln-user-biography">
                        <span class="ln-user-biography__title">ABOUT ME</span>

                        <Markdown source={props.profile!.bio!} />

                        {props.bioExt}
                    </div>
                </Show>
            </div>
        </div>
    )
}