import React from "react";
import { useSelector } from "react-redux";
import { createSelector, createStructuredSelector } from "reselect";
import { RootState } from "state/root";

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

import "./member_list.scss";
export const MemberList = React.memo(() => {
    let { members } = useSelector(user_list_selector);

    let list = !members ? null : Array.from(members.values(), (member) => {
        let user = member.user!;
        let nick = member.nick || user.username;

        return (
            <div key={user.id}>
                {nick}
            </div>
        );
    });

    return (
        <ul className="ln-member-list">
            {list}
        </ul>
    )
})