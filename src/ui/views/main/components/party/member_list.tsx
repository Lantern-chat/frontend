import { createMemo, For, Show } from "solid-js";
import { useStructuredSelector } from "solid-mutant";

import { useI18nContext } from "ui/i18n/i18n-solid";
import { useLocale } from "ui/i18n";

import { parse_presence, PartyMember, PresenceStatus, Role, Snowflake, UserPreferenceFlags, user_is_bot } from "state/models";
import { ReadRootState, useRootSelector } from "state/root";
import { activeParty } from "state/selectors/active";
import { selectPrefsFlag } from "state/selectors/prefs";

import { VectorIcon } from "ui/components/common/icon";

import { UserAvatar } from "../user_avatar";
import { BotLabel } from "../misc/bot_label";

import { Icons } from "lantern-icons";

import "./member_list.scss";
import { UIText } from "ui/components/common/ui-text";
import { pickColorFromHash } from "lib/palette";
import { AnchoredModal } from "ui/components/modal/anchored";
import { UserCard } from "../menus/user_card";
import { createSimpleToggleOnClick } from "ui/hooks/useMain";
export function MemberList() {
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

    let { locale, lang } = useLocale();

    // NOTE: Ensure it uses the dayjs-locale
    let collator = createMemo(() => new Intl.Collator(lang().d || locale(), { sensitivity: 'base' }));

    // name changes are rare, so sort these first
    let sorted_members = createMemo(() => {
        let members = state.party?.members, c = collator();
        if(members) {
            return Object.values(members).sort((a, b) => c.compare(
                a.nick || a.user.username,
                b.nick || b.user.username,
            ))
        }
        return;
    });

    let grouped_members = createMemo(() => {
        let members = sorted_members(),
            party = state.party?.party;

        let offline = [], online = [],
            hoisted: Array<{ role: Role, members: Array<DeepReadonly<PartyMember>> }> = [];

        if(members && party) {
            let roles = party.roles;

            if(roles.length) {
                hoisted = roles.filter(role => (role.flags & 1))
                    .map(role => ({ role, members: [] }))
                    .sort((a, b) => a.role.position - b.role.position);
            }

            outer: for(let member of members) {
                let presence = parse_presence(member.presence);

                // TODO: Replace with member.flags != 0 ?
                if(presence.status != PresenceStatus.Offline) {
                    // if the member is in any roles AND if there are any roles to hoist
                    if(hoisted && member.roles) {
                        for(let hr of hoisted) {
                            // iterate through each hoisted role and check if this member is part of it
                            // TODO: More efficient array intersection, probably using sets/maps
                            if(member.roles.includes(hr.role.id)) {
                                hr.members.push(member);
                                continue outer; // don't include in other sections
                            }
                        }
                    }

                    // if not in a hoistable role, default to regular list
                    online.push(member);
                } else if(members.length < 1000) {
                    // TODO: Set "Large" threshold in config and move this into server
                    offline.push(member);
                }
            }
        }

        return { offline, online, hoisted };
    });

    const { LL } = useI18nContext();

    return (
        <Show when={state.party}>
            <div class="ln-member-list ln-scroll-y ln-scroll-fixed">
                <For each={grouped_members().hoisted}>
                    {hoisted => <RoleMemberList
                        role={hoisted.role.name}
                        members={hoisted.members}
                        owner={state.party!.party.owner}
                        is_light_theme={state.is_light_theme} />}
                </For>

                <RoleMemberList
                    role={LL().main.ONLINE()}
                    members={grouped_members().online}
                    owner={state.party!.party.owner}
                    is_light_theme={state.is_light_theme} />

                <RoleMemberList
                    role={LL().main.OFFLINE()}
                    members={grouped_members().offline}
                    owner={state.party!.party.owner}
                    is_light_theme={state.is_light_theme} />
            </div>
        </Show>
    )
}

interface IRoleMemberListProps {
    role: string,
    members: Array<DeepReadonly<PartyMember>>,
    owner: Snowflake,
    is_light_theme: boolean,
}

// TODO: Localized number formatting for length
function RoleMemberList(props: IRoleMemberListProps) {
    let { LL } = useI18nContext();

    return (
        <Show when={props.members.length}>
            <div>
                <h4 class="ui-text" textContent={LL().main.member_list.ROLE({ role: props.role, length: props.members.length })} />
                <ul>
                    <For each={props.members}>
                        {member => <ListedMember member={member} owner={props.owner} is_light_theme={props.is_light_theme} />}
                    </For>
                </ul>
            </div>
        </Show>
    )
}

interface IListedMemberProps {
    owner: Snowflake,
    member: DeepReadonly<PartyMember>,
    is_light_theme: boolean,
}

function ListedMember(props: IListedMemberProps) {
    let { LL } = useI18nContext();

    let color = useRootSelector(state => {
        let party_id, party;

        if(party_id = activeParty(state)) {
            if(party = state.party.parties[party_id]) {
                return party.member_colors[props.member.user.id];
            }
        }
        return;
    });

    let display_name = createMemo(() => props.member.nick || props.member.user.username);

    let presence = createMemo(() => parse_presence(props.member.presence));

    let [show, main_click_props] = createSimpleToggleOnClick();

    return (
        <li class="ln-member-list__item" {...main_click_props}>
            <AnchoredModal show={show()}>
                                <UserCard user={props.member.user} />
                            </AnchoredModal>
            <UserAvatar nickname={display_name()}
                user={props.member.user}
                status={presence().status}
                is_light_theme={props.is_light_theme}
                is_mobile={presence().is_mobile} />

            <div class="ln-member__meta">
                <div class="ln-member__title">

                    <div class="ln-member__name">
                        <span class="ui-text" style={{ color: color() }} textContent={display_name()} />
                    </div>

                    <Show when={props.member.user.id == props.owner}>
                        <div class="ln-member__spacer" />
                        <div class="ln-member__crown" title={LL().main.OWNER()}>
                            <VectorIcon id={Icons.Crown} />
                        </div>
                    </Show>

                    <Show when={user_is_bot(props.member.user)}>
                        <BotLabel />
                    </Show>
                </div>

                <Show when={props.member.user.status && presence().status != PresenceStatus.Offline}>
                    <div class="ln-member__status">
                        <span class="chat-text" textContent={props.member.user.status} />
                    </div>
                </Show>
            </div>
        </li>
    );
}