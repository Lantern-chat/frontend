import { pickColorFromHash } from "lib/palette";
import React from "react";
import { useSelector } from "react-redux";
import { createSelector, createStructuredSelector } from "reselect";
import { RootState } from "state/root";

import { Avatar } from "ui/components/common/avatar";

let user_list_selector = createSelector(
    (state: RootState) => state.history.parts[1], // party_id
    (state: RootState) => state.history.parts[2], // room_id
    (state: RootState) => state.party.parties,
    (party_id, room_id, parties) => {
        let party = parties.get(party_id);

        return {
            members: party?.members,
        }
    }
)

let other_selector = createStructuredSelector({
    is_light_theme: (state: RootState) => state.theme.is_light,
});

import "./member_list.scss";
export const MemberList = React.memo(() => {
    let { members } = useSelector(user_list_selector);
    let { is_light_theme } = useSelector(other_selector);

    let list = !members ? null : Array.from(members.values(), (member) => {
        let user = member.user!;
        let nick = member.nick || user.username;

        return (
            <li key={user.id} className="ln-member-list__item">
                <div className="ln-member__avatar">
                    <Avatar username={nick} text={nick.charAt(0)} backgroundColor={pickColorFromHash(user.id, is_light_theme)} />
                    <div className="ln-member__status"><span /></div>
                </div>
                <div className="ln-member__name">
                    <span>{nick}</span>
                </div>
            </li>
        );
    });

    return (
        <ul className="ln-member-list ln-scroll-y ln-scroll-fixed">
            {list}
        </ul>
    )
})