import { createMemo, For, Show } from "solid-js";
import { useStructuredSelector } from "solid-mutant";

import { parse_presence, PartyMember, PresenceStatus, Role, Snowflake, UserPreferenceFlags, user_is_bot } from "state/models";
import { RootState, useRootSelector } from "state/root";
import { activeParty } from "state/selectors/active";
import { selectPrefsFlag } from "state/selectors/prefs";

import { VectorIcon } from "ui/components/common/icon";

import { UserAvatar } from "../user_avatar";
import { BotLabel } from "../misc/bot_label";

import { CrownIcon } from "lantern-icons";

import "./member_list.scss";
import { ObjectMap } from "state/util/map_set";
export function MemberList() {
    let state = useStructuredSelector({
        is_light_theme: selectPrefsFlag(UserPreferenceFlags.LightMode),
        party: (state: RootState) => {
            let party_id = activeParty(state);
            if(party_id) {
                return state.party.parties[party_id];
            }
            return;
        },
    });

    let grouped_members = createMemo(() => {
        let members = ObjectMap(state.party?.members),
            party = state.party?.party;

        let offline = [], online = [],
            hoisted: Array<{ role: Role, members: Array<DeepReadonly<PartyMember>> }> = [];

        if(members.size && party) {
            let roles = party.roles;

            if(roles.length) {
                hoisted = roles.filter(role => (role.flags & 1))
                    .map(role => ({ role, members: [] }))
                    .sort((a, b) => a.role.position - b.role.position);
            }

            outer: for(let member of members.values()) {
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
                } else if(members.size < 1000) {
                    // TODO: Set "Large" threshold in config
                    offline.push(member);
                }
            }
        }

        return { offline, online, hoisted };
    });

    return (
        <Show when={state.party}>
            <div className="ln-member-list ln-scroll-y ln-scroll-fixed">
                <For each={grouped_members().hoisted}>
                    {hoisted => <RoleMemberList
                        role={hoisted.role.name}
                        members={hoisted.members}
                        owner={state.party!.party.owner}
                        is_light_theme={state.is_light_theme} />}
                </For>

                <RoleMemberList
                    role="Online"
                    members={grouped_members().online}
                    owner={state.party!.party.owner}
                    is_light_theme={state.is_light_theme} />

                <RoleMemberList
                    role="Offline"
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

function RoleMemberList(props: IRoleMemberListProps) {
    let collator = new Intl.Collator('en-US', { sensitivity: 'base' });

    let sorted = createMemo(() => props.members.slice().sort((a, b) => collator.compare(
        a.nick || a.user.username,
        b.nick || b.user.username,
    )));

    return (
        <Show when={props.members.length}>
            <div>
                <h4 className="ui-text">{props.role} – {props.members.length}</h4>
                <ul>
                    <For each={sorted()}>
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

    return (
        <li className="ln-member-list__item">
            <UserAvatar nickname={display_name()}
                user={props.member.user}
                status={presence().status}
                is_light_theme={props.is_light_theme}
                is_mobile={presence().is_mobile} />

            <div className="ln-member__meta">
                <div className="ln-member__title">

                    <div className="ln-member__name">
                        <span className="ui-text" style={{ color: color() }}>
                            {display_name()}
                        </span>
                    </div>

                    <Show when={props.member.user.id == props.owner}>
                        <div className="ln-member__spacer" />
                        <div className="ln-member__crown" title="Owner">
                            <VectorIcon src={CrownIcon} />
                        </div>
                    </Show>

                    <Show when={user_is_bot(props.member.user)}>
                        <BotLabel />
                    </Show>
                </div>

                <Show when={props.member.user.status && presence().status != PresenceStatus.Offline}>
                    <div className="ln-member__status">
                        <span className="chat-text">{props.member.user.status}</span>
                    </div>
                </Show>
            </div>
        </li>
    );
}