import { pickColorFromHash } from "lib/palette";
import React, { useMemo } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { createSelector, createStructuredSelector } from "reselect";
import { hasUserPrefFlag, parse_presence, PartyMember, Role, Snowflake, UserPreferenceFlags } from "state/models";
import { RootState } from "state/root";
import { activeParty } from "state/selectors/active";
import { selectPrefsFlag } from "state/selectors/prefs";
import { Glyphicon } from "ui/components/common/glyphicon";

import { UserAvatar } from "../user_avatar";

import CrownIcon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-425-crown.svg";

let user_list_selector = createSelector(
    activeParty, // party_id
    (state: RootState) => state.party.parties,
    selectPrefsFlag(UserPreferenceFlags.LightMode),
    (party_id, parties, is_light_theme) => {
        let party = party_id ? parties.get(party_id) : null;

        if(!party) return { is_light_theme };

        return {
            members: party.members,
            owner: party.party.owner,
            is_light_theme,
            roles: party.party.roles,
        }
    }
)

type PartyMemberExtra = PartyMember & ReturnType<typeof parse_presence>;

import "./member_list.scss";
export const MemberList = React.memo(() => {
    let { members, owner, is_light_theme, roles } = useSelector(user_list_selector);

    let sorted_members: undefined | Array<PartyMemberExtra> = useMemo(() => {
        if(members) {
            let collator = new Intl.Collator('en-US', { sensitivity: 'base' }),
                sorted_members = Array.from(members.values(), member => ({
                    ...member,
                    ...parse_presence(member.presence)
                }));

            sorted_members.sort((a, b) => collator.compare(
                a.nick || a.user.username,
                b.nick || b.user.username,
            ));

            return sorted_members;
        }
        return;
    }, [members]);

    let grouped_members = useMemo(() => {
        if(!sorted_members) return;

        let offline = [], online = [],
            role_groups: undefined | Array<{ role: Role, members: PartyMemberExtra[] }>;
        if(roles) {
            // find all roles that should be hoisted and initialize them
            role_groups = roles.filter(role => ((role.flags & 1) == 1)).map(role => ({ role, members: [] }));

            // sort the hoistable roles
            role_groups.sort((a, b) => a.role.position - b.role.position);
        }

        outer: for(let member of sorted_members) {
            // if online (not offline)
            if(member.status != 'offline') {
                if(member.roles && role_groups) {
                    // TODO: More efficient array intersection
                    for(let rg of role_groups) {
                        if(member.roles.includes(rg.role.id)) {
                            rg.members.push(member);
                            continue outer;
                        }
                    }
                }

                // if not in a hoistable role, default to regular list
                online.push(member);
            } else {
                offline.push(member);
            }
        }

        return { hoisted: role_groups, offline, online };
    }, [sorted_members, roles]);

    type MaybeEmptyList = Array<React.ReactNode> | React.ReactNode;

    let hoisted_list, online_list: MaybeEmptyList, offline_list: MaybeEmptyList;
    if(grouped_members) {
        let { hoisted, online, offline } = grouped_members;

        if(hoisted) {
            hoisted_list = hoisted.map((({ role, members }) => members.length == 0 ? null : (
                <div key={role.id}>
                    <h4 className="ui-text">{role.name} – {members.length}</h4>
                    <ul>
                        {members.map((member, i) => (
                            <ListedMember key={member.user.id || i} member={member} owner={owner!} is_light_theme={is_light_theme} />
                        ))}
                    </ul>
                </div>
            )));
        }

        let gen_list = (list: Array<PartyMemberExtra>, name: string) => (
            list.length == 0 ? null : <div>
                <h4 className="ui-text">{name} – {list.length}</h4>
                <ul>
                    {list.map((member, i) => (
                        <ListedMember key={member.user.id || i} member={member} owner={owner!} is_light_theme={is_light_theme} />
                    ))}
                </ul>
            </div>
        );

        online_list = gen_list(online, "Online");
        offline_list = gen_list(offline, "Offline");
    }

    return (
        <div className="ln-member-list ln-scroll-y ln-scroll-fixed">
            {hoisted_list}
            {online_list}
            {offline_list}
        </div>
    )
});

interface IListedMemberProps {
    owner: Snowflake,
    member: PartyMemberExtra,
    is_light_theme: boolean,
}

const ListedMember = ({ member, owner, is_light_theme }: IListedMemberProps) => {
    let user = member.user,
        nick = member.nick || user.username,
        crown;

    let color = useSelector((state: RootState) => {
        let party_id = activeParty(state);
        if(!party_id) return;

        let party = state.party.parties.get(party_id);
        if(!party) return;

        return party.member_colors.get(member.user.id);
    });

    if(user.id == owner) {
        crown = (
            <>
                <div className="ln-member__spacer" />
                <div className="ln-member__crown" title="Owner">
                    <Glyphicon src={CrownIcon} />
                </div>
            </>
        );
    }

    return (
        <li className="ln-member-list__item">
            <UserAvatar nickname={nick} user={user} status={member.status}
                is_light_theme={is_light_theme} is_mobile={member.is_mobile} />

            <div className="ln-member__name">
                <span className="ui-text" style={{ color }}>{nick}</span>
            </div>

            {crown}
        </li>
    );
};