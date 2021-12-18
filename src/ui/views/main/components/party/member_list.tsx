import React, { useMemo } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { createSelector, createStructuredSelector } from "reselect";
import intersect from 'fast_array_intersect';

import { parse_presence, PartyMember, PresenceStatus, Role, Snowflake, UserPreferenceFlags, user_is_bot } from "state/models";
import { RootState } from "state/root";
import { activeParty } from "state/selectors/active";
import { selectPrefsFlag } from "state/selectors/prefs";

import { Glyphicon } from "ui/components/common/glyphicon";

import { UserAvatar } from "../user_avatar";
import { BotLabel } from "../misc/bot_label";

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
            hoisted: undefined | Array<{ role: Role, members: PartyMemberExtra[] }>;

        if(roles && roles.length) {
            // find all roles that should be hoisted and initialize them
            hoisted = roles.filter(role => ((role.flags & 1) == 1)).map(role => ({ role, members: [] }));

            // sort the hoistable roles
            hoisted.sort((a, b) => a.role.position - b.role.position);
        }

        outer: for(let member of sorted_members) {
            // if online (not offline)
            if(member.status != PresenceStatus.Offline) {
                // if the member is in any roles AND if there are any roles to hoist
                if(member.roles && hoisted) {
                    // iterate through each hoisted role and check if this member is part of it
                    // TODO: More efficient array intersection, probably using sets/maps
                    for(let hr of hoisted) {
                        if(member.roles.includes(hr.role.id)) {
                            hr.members.push(member);
                            continue outer; // don't include in other sections
                        }
                    }
                }

                // if not in a hoistable role, default to regular list
                online.push(member);
            } else {
                offline.push(member);
            }
        }

        return { hoisted, offline, online };
    }, [sorted_members, roles]);

    type MaybeEmptyList = Array<React.ReactNode> | React.ReactNode;

    let hoisted_list, online_list: MaybeEmptyList, offline_list: MaybeEmptyList;
    if(grouped_members) {
        let { hoisted, online, offline } = grouped_members;

        let gen_list = (list: Array<PartyMemberExtra>, name: string, key: string = name) => (
            list.length == 0 ? null : <div key={key}>
                <h4 className="ui-text">{name} – {list.length}</h4>
                <ul>
                    {list.map((member, i) => (
                        <ListedMember key={member.user.id || i} member={member} owner={owner!} is_light_theme={is_light_theme} />
                    ))}
                </ul>
            </div>
        );

        if(hoisted) {
            // NOTE: __role is appended for if someone makes a role named "Online" or "Offline" to avoid duplicate keys
            hoisted_list = hoisted.map(({ role, members }) => gen_list(members, role.name, role.name + "__role"));
        }

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
        crown, status;

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

    if(user.status && member.status != PresenceStatus.Offline) {
        status = (
            <div className="ln-member__status">
                <span className="chat-text">{user.status}</span>
            </div>
        );
    }

    let bot;
    if(user_is_bot(user)) {
        bot = <BotLabel />
    }

    return (
        <li className="ln-member-list__item">
            <UserAvatar nickname={nick} user={user} status={member.status}
                is_light_theme={is_light_theme} is_mobile={member.is_mobile} />

            <div className="ln-member__meta">
                <div className="ln-member__title">

                    <div className="ln-member__name">
                        <span className="ui-text" style={{ color }}>{nick}</span>
                    </div>

                    {crown}

                    {bot}
                </div>

                {status}
            </div>
        </li>
    );
};