import { createMemo, Show } from "solid-js";
import { useStructuredSelector } from "solid-mutant";
import { PartyMember, Snowflake, User, parse_presence, UserPreferenceFlags, user_is_bot } from "state/models";
import { ReadRootState, useRootSelector } from "state/root";
import { activeParty } from "state/selectors/active";
import { selectCachedUser } from "state/selectors/selectCachedUser";
import { useI18nContext } from "ui/i18n/i18n-solid";
import { copyText } from "lib/clipboard";
import { selectPrefsFlag } from "state/selectors/prefs";
import { pickColorFromHash } from "lib/palette";
import { Markdown } from "ui/components/common/markdown";
import { Branch } from "ui/components/flow";
import { UserAvatar } from "../user_avatar";
import { BotLabel } from "../misc/bot_label";

export interface IUserCardProps {
    user: User,
    member?: PartyMember,
    party_id?: Snowflake,
}

import "./list.scss";
import "./user_card.scss";
export function UserCard(props: IUserCardProps) {
    const { LL } = useI18nContext();

    let cached_user = useRootSelector((state: ReadRootState) => {
        let active_party = state.chat.active_party;
        return selectCachedUser(state, props.user.id, active_party);
    });

    let discriminator = createMemo(() => props.user.discriminator.toString(16).toUpperCase().padStart(4, '0'));

    let state = useStructuredSelector({
        is_light_theme: selectPrefsFlag(UserPreferenceFlags.LightMode),
        party: (state: ReadRootState) => {
            let party_id = activeParty(state);
            if(party_id) {
                return state.party.parties[party_id];
            }
            return;
        },
    });

    let member_info = createMemo(() => state.party?.members[props.user.id]);
    let presence = createMemo(() => parse_presence(member_info()?.presence));
    let nick = createMemo(() => member_info()?.nick);

    return (
        <Show when={cached_user()} fallback={<span class="ui-text">User Not Found</span>}>
            {cached_user => (
                <div class="ln-user-card ln-contextmenu">
                    <div class="ln-user-card__header">
                        <div class="banner"
                            style={{ "background-color": pickColorFromHash(props.user.id, state.is_light_theme) }}
                        />

                        <UserAvatar nickname={nick() || cached_user.user.username}
                            user={cached_user.user}
                            status={presence().status}
                            is_light_theme={state.is_light_theme}
                            is_mobile={presence().is_mobile} />
                    </div>

                    <div class="ln-user-card__info">
                        <div class="ui-text ln-username" onClick={() => copyText(props.user.username + '#' + discriminator())}>
                            <Branch>
                                <Branch.If when={nick()}>
                                    <h4>{nick()}</h4>
                                    <span>{props.user.username}<span class="ln-username__discriminator">#{discriminator()}</span></span>
                                </Branch.If>
                                <Branch.Else>
                                    <h4>{props.user.username}<span class="ln-username__discriminator">#{discriminator()}</span></h4>
                                </Branch.Else>
                            </Branch>
                            <Show when={user_is_bot(props.user)}>
                                <BotLabel />
                            </Show>
                        </div>

                        <Show when={cached_user.user.status}>
                            {status => <div class="ln-user-custom-status" textContent={status} />}
                        </Show>

                        <Show when={cached_user.user.bio}>
                            <hr />
                            <div class="ln-user-biography">
                                <span class="ln-user-biography__title">ABOUT ME</span>

                                <Markdown source={cached_user.user.bio!} />
                            </div>
                        </Show>
                    </div>
                </div>
            )}
        </Show>
    );
}