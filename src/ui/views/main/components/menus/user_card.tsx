import { createMemo, Match, Show, Switch } from "solid-js";
import { useStructuredSelector } from "solid-mutant";
import { PartyMember, Snowflake, User, PresenceStatus, parse_presence, UserPreferenceFlags } from "state/models";
import { ReadRootState, useRootSelector } from "state/root";
import { activeParty } from "state/selectors/active";
import { selectCachedUser } from "state/selectors/selectCachedUser";
import { Avatar } from "ui/components/common/avatar";
import { useI18nContext } from "ui/i18n/i18n-solid";
import { copyText } from "lib/clipboard";
import { VectorIcon } from 'ui/components/common/icon';

import { Icons } from "lantern-icons";

export interface IUserCardProps {
    user: User,
    member?: PartyMember,
    party_id?: Snowflake,
}

import "./list.scss";
import "./user_card.scss";
import { selectPrefsFlag } from "state/selectors/prefs";
import { pickColorFromHash } from "lib/palette";
import { Markdown } from "ui/components/common/markdown";
export function UserCard(props: IUserCardProps) {
    const { LL } = useI18nContext();

    let cached_user = useRootSelector((state: ReadRootState) => {
        let active_party = state.chat.active_party;
        return selectCachedUser(state, props.user.id, active_party);
    });

    let user_discriminator = createMemo(() => props.user.discriminator.toString(16).toUpperCase().padStart(4, '0')) ;
    
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
    let background_color = createMemo(() => pickColorFromHash(props.user.id, state.is_light_theme));
    let presence = createMemo(() => parse_presence(member_info()?.presence));

    let status = createMemo(() => {
        switch(presence().status) {
            case PresenceStatus.Online: return [LL().main.ONLINE(), "online"];
            case PresenceStatus.Busy: return [LL().main.BUSY(), "busy"];
            case PresenceStatus.Away: return [LL().main.AWAY(), "away"];
            default: return [LL().main.OFFLINE(), "offline"];
        }
    });

    let nick = createMemo(() => member_info()?.nick);

    
    return (
        <Show when={cached_user()} fallback={<span class="ui-text">User Not Found</span>}>
            {cached_user => {
                return (
                    <>
                <div class="ln-user-card ln-contextmenu">
                    <div class="banner" style={{"background-color":background_color()}}></div>
                    <Avatar username={props.user.username} text={(nick() ?? cached_user.user.username)?.charAt(0)} backgroundColor={background_color()} rounded={true} />
                    <div class="ln-user-status" title={status()[0]}>
                        <Show
                            fallback={<span class={status()[1]} />}
                            when={presence().status == PresenceStatus.Online && presence().is_mobile}
                        >
                            <VectorIcon id={Icons.MobilePhone} />
                        </Show>
                    </div>
                    <div class="ln-username" onClick={() => copyText(cached_user.user.username + '#'+user_discriminator)}>
                        <Switch>
                            <Match when={nick()}>
                            <h4 class="ui-font">{nick}</h4>
                                <span class="ln-username__discrim">{cached_user.user.username} #{user_discriminator}</span>
                            </Match>
                            <Match when={!nick()}>
                                <div class="font-large"><span class="ui-font">{cached_user.user.username}</span> <span class="ln-username__discrim">#{user_discriminator}</span></div>
                            </Match>
                        </Switch>
                    </div>
                    <Show when={cached_user.user.status}>
                        {status => <div class="ln-user-custom-status" textContent={status}/>}
                    </Show>
                    <Show when={cached_user.user.bio}>
                        <div class="divider"></div>
                        <div class="ln-user-biography">
                            <strong class="ln-user-biography-title">ABOUT ME</strong>
                            <Markdown source={cached_user.user.bio!} />
                        </div>
                    </Show>
                </div></>
                )
            }}
        </Show>
    );
}