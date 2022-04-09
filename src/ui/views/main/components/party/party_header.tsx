import { Show } from "solid-js";
import { useRootSelector } from "state/root";
import { activeParty } from "state/selectors/active";

import { VectorIcon } from "ui/components/common/icon";
import { UIText } from "ui/components/common/ui-text";

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
            <header className="ln-party-header">
                <div className="ln-party-header__name">
                    <UIText text={party()!.party.name} />
                </div>

                <VectorIcon src={BalloonsIcon} />
            </header>
        </Show>
    );
}