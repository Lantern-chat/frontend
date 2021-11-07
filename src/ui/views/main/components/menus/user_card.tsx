import React, { useCallback } from "react";
import { useSelector } from "react-redux";

import { PartyMember, Snowflake, User } from "state/models";
import { RootState } from "state/root";
import { selectCachedUser } from "state/selectors/selectCachedUser";

export interface IUserCardProps {
    user: User,
    member?: PartyMember,
    party_id?: Snowflake,
}

import "./list.scss";
import "./user_card.scss";
export const UserCard = React.memo((props: IUserCardProps) => {
    let nick = props.member?.nick;

    let cached_user = useSelector((state: RootState) => {
        let active_party = state.chat.active_party;
        return selectCachedUser(state, props.user.id, active_party);
    });

    if(!cached_user) {
        return <span className="ui-text">User Not Found</span>
    }

    let { user, presence } = cached_user;

    return (
        <div className="ln-user-card ln-contextmenu">
            <span className="ui-text">User: {user.username}</span>
        </div>
    );
});

if(__DEV__) {
    UserCard.displayName = "UserCard";
}