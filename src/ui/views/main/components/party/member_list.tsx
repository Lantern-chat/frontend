import { pickColorFromHash } from "lib/palette";
import React from "react";
import { useSelector } from "react-redux";
import { createSelector, createStructuredSelector } from "reselect";
import { RootState } from "state/root";

import { UserAvatar } from "../user_avatar";

let user_list_selector = createSelector(
    (state: RootState) => state.chat.active_party, // party_id
    (state: RootState) => state.chat.active_room, // room_id
    (state: RootState) => state.party.parties,
    (party_id, room_id, parties) => {
        let party = party_id ? parties.get(party_id) : null;

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
                <UserAvatar nickname={nick} user={user} status="online" is_light_theme={is_light_theme} />
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