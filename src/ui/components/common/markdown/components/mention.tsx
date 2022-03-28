import { createMemo, Match, Show, Switch } from "solid-js";
import { composeSelectors } from "solid-mutant";
import { Snowflake } from "state/models";
import { RootState, useRootSelector } from "state/root";
import { Link } from "ui/components/history";

export interface IMentionProps {
    prefix: '@' | '#',
    id: Snowflake,
}

const mention_selector = composeSelectors<RootState>()(
    [state => state.chat.active_party, state => state.party.parties],
    (active_party, parties) => {
        let ap = active_party();
        return ap ? parties()[ap] : void 0;
    }
);

import "./mention.scss";
export function Mention(props: IMentionProps) {
    let party = useRootSelector(mention_selector),
        room = createMemo(() => party()?.rooms.find(room => room.id == props.id)),
        member = createMemo(() => party()?.members[props.id]);

    return (
        <Switch>
            <Match when={props.prefix == '#'}>
                <Show when={room()} fallback={<span textContent={`<#${props.id}>`} />}>
                    {room => <Link className="ln-channel-mention" href={`/channels/${room.party_id}/${room.id}`}>#{room.name}</Link>}
                </Show>
            </Match>
            <Match when={props.prefix == '@'}>
                <Show when={member()} fallback={<span textContent={`<@${props.id}>`} />}>
                    {member => <span className="ln-user-mention">@{member.nick || member.user.username}</span>}
                </Show>
            </Match>
        </Switch>
    );
}