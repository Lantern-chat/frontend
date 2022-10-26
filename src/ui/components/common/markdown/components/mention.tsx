import { Match, Show, Switch } from "solid-js";
import { Snowflake } from "state/models";
import { useRootSelector } from "state/root";
import { Link } from "ui/components/history";

export interface IMentionProps {
    prefix: '@' | '#',
    id: Snowflake,
}

import "./mention.scss";
export function Mention(props: IMentionProps) {
    let party = useRootSelector(state => {
        let active_party = state.chat.active_party;
        if(active_party) { return state.party.parties[active_party]; }
        return;
    });

    switch(props.prefix) {
        case '@': return (
            <Show keyed when={party()?.members[props.id]} fallback={<span textContent={`<@${/*@once*/props.id}>`} />}>
                {member => <span class="ln-user-mention">@{member.user.profile?.nick || member.user.username}</span>}
            </Show>
        );
        case '#': return (
            <Show keyed when={party()?.rooms[props.id]} fallback={<span textContent={`<#${/*@once*/props.id}>`} />}>
                {room => <Link class="ln-channel-mention" href={`/channels/${room.party_id}/${room.id}`}>#{room.name}</Link>}
            </Show>
        );
        default: return null;
    }
}

function UserMention(props: { id: Snowflake }) {

}