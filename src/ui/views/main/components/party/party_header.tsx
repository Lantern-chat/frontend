import { Show } from "solid-js";
import { useRootSelector } from "state/root";
import { activeParty } from "state/selectors/active";

import { VectorIcon } from "ui/components/common/icon";

import { BalloonsIcon } from "lantern-icons";

import "./party_header.scss";
export function PartyHeader() {
    let party = useRootSelector(state => {
        let active_party = activeParty(state);
        if(active_party) {
            return state.party.parties[active_party];
        }
        return;
    });

    return (
        <Show when={party()}>
            {party => (
                <header className="ln-party-header">
                    <div className="ln-party-header__name">
                        <span className="ui-text">{party.party.name}</span>
                    </div>

                    <VectorIcon src={BalloonsIcon} />
                </header>
            )}
        </Show>
    );
}