import { pickColorFromHash } from "lib/palette";
import React, { useMemo } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { createSelector, createStructuredSelector } from "reselect";
import { hasUserPrefFlag, parse_presence, PartyMember, Snowflake, UserPreferenceFlags } from "state/models";
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
        }
    }
)

import "./member_list.scss";
export const MemberList = React.memo(() => {
    let { members, owner, is_light_theme } = useSelector(user_list_selector),
        list;


    if(members) {
        list = Array.from(members.values(), (member, i) => (
            <ListedMember key={member.user?.id || i} member={member} owner={owner!} is_light_theme={is_light_theme} />
        ))
    }

    return (
        <ul className="ln-member-list ln-scroll-y ln-scroll-fixed">
            {list}
        </ul>
    )
});

interface IListedMemberProps {
    owner: Snowflake,
    member: PartyMember,
    is_light_theme: boolean,
}

const ListedMember = ({ member, owner, is_light_theme }: IListedMemberProps) => {
    let user = member.user!,
        nick = member.nick || user.username,
        { status, is_mobile } = parse_presence(member.presence),
        crown;

    let color = useSelector((state: RootState) => {
        let party_id = activeParty(state);
        if(!party_id) return;

        let party = state.party.parties.get(party_id);
        if(!party) return;

        return party.member_colors.get(member.user!.id);
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
            <UserAvatar nickname={nick} user={user} status={status}
                is_light_theme={is_light_theme} is_mobile={is_mobile} />

            <div className="ln-member__name">
                <span className="ui-text" style={{ color }}>{nick}</span>
            </div>

            {crown}
        </li>
    );
};