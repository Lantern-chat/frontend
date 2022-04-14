import { Show } from "solid-js";
import { PartyMember, Snowflake, User } from "state/models";
import { ReadRootState, useRootSelector } from "state/root";
import { selectCachedUser } from "state/selectors/selectCachedUser";

export interface IUserCardProps {
    user: User,
    member?: PartyMember,
    party_id?: Snowflake,
}

import "./list.scss";
import "./user_card.scss";
export function UserCard(props: IUserCardProps) {
    let nick = props.member?.nick;

    let cached_user = useRootSelector((state: ReadRootState) => {
        let active_party = state.chat.active_party;
        return selectCachedUser(state, props.user.id, active_party);
    });

    return (
        <Show when={cached_user()} fallback={<span className="ui-text">User Not Found</span>}>
            {cached_user => (
                <div className="ln-user-card ln-contextmenu">
                    <span className="ui-text">User: {cached_user.user.username}</span>
                </div>
            )}
        </Show>
    );
}