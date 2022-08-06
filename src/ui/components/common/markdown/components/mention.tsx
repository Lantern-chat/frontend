import { createMemo, Match, Show, Switch } from "solid-js";
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
        if(active_party) {
            return state.party.parties[active_party];
        }
        return;
    });

    let room = () => party()?.rooms.find(room => room.id == props.id),
        member = () => party()?.members[props.id];

    return (
        <Switch>
            <Match when={props.prefix == '#'}>
                <Show when={room()} fallback={<span textContent={`<#${props.id}>`} />}>
                    {room => <Link class="ln-channel-mention" href={`/channels/${room.party_id}/${room.id}`}>#{room.name}</Link>}
                </Show>
            </Match>
            <Match when={props.prefix == '@'}>
                <Show when={member()} fallback={<span textContent={`<@${props.id}>`} />}>
                    {member => <span class="ln-user-mention">@{member.nick || member.user.username}</span>}
                </Show>
            </Match>
        </Switch>
    );
}