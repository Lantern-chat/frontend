import { pickColorFromHash } from "lib/palette";
import React from "react";
import { useSelector } from "react-redux";
import { createSelector, createStructuredSelector } from "reselect";
import { hasUserPrefFlag, parse_presence, UserPreferenceFlags } from "state/models";
import { RootState } from "state/root";
import { activeParty } from "state/selectors/active";
import { selectPrefsFlag } from "state/selectors/prefs";
import { Glyphicon } from "ui/components/common/glyphicon";

import { UserAvatar } from "../user_avatar";

import CrownIcon from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-425-crown.svg";

let user_list_selector = createSelector(
    activeParty, // party_id
    (state: RootState) => state.party.parties,
    (party_id, parties) => {
        let party = party_id ? parties.get(party_id) : null;

        if(!party) return {};

        return {
            members: party.members,
            owner: party.party.owner,
        }
    }
)

let other_selector = createStructuredSelector({
    is_light_theme: selectPrefsFlag(UserPreferenceFlags.LightMode),
});

import "./member_list.scss";
export const MemberList = React.memo(() => {
    let { members, owner } = useSelector(user_list_selector);
    let { is_light_theme } = useSelector(other_selector);

    let list = !members ? null : Array.from(members.values(), (member) => {
        let user = member.user!,
            nick = member.nick || user.username,
            { status, is_mobile } = parse_presence(member.presence);

        let crown;
        if(user.id == owner) {
            crown = (
                <>
                    <div className="ln-member__spacer" />
                    <div className="ln-member__crown">
                        <Glyphicon src={CrownIcon} />
                    </div>
                </>
            );
        }

        return (
            <li key={user.id} className="ln-member-list__item">
                <UserAvatar nickname={nick} user={user} status={status}
                    is_light_theme={is_light_theme} is_mobile={is_mobile} />

                <div className="ln-member__name">
                    <span className="ui-text">{nick}</span>
                </div>

                {crown}
            </li>
        );
    });

    return (
        <ul className="ln-member-list ln-scroll-y ln-scroll-fixed">
            {list}
        </ul>
    )
})