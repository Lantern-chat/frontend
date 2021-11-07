import React from "react";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { Snowflake } from "state/models";
import { RootState } from "state/root";
import { Link } from "ui/components/history";

export interface IMentionProps {
    prefix: '@' | '#',
    id: Snowflake,
}

const mention_selector = createSelector(
    (state: RootState) => state.chat.active_party,
    (state: RootState) => state.party.parties,
    (active_party, parties) => {
        if(!active_party) return;

        return parties.get(active_party)
    }
);

export const Mention = React.memo((props: IMentionProps) => {
    let party = useSelector(mention_selector);

    switch(props.prefix) {
        case '#': {
            if(party) {
                let room = party.rooms.find(room => room.id == props.id);

                if(room) {
                    return <Link href={`/channels/${party.party.id}/${room.id}`}>#{room.name}</Link>
                }
            }

            return <span>{`<#${props.id}>`}</span>;
        }
        case '@': {
            if(party) {
                let member = party.members.get(props.id);

                if(member) {
                    return <span>@{member.nick || member.user.username}</span>;
                }
            }

            return <span>{`<@${props.id}>`}</span>;
        }
    }
});

if(__DEV__) {
    Mention.displayName = "Mention";
}