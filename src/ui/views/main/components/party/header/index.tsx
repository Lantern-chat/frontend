import { createSignal, Show } from "solid-js";
import { useRootSelector } from "state/root";
import { activeParty } from "state/selectors/active";

import { VectorIcon } from "ui/components/common/icon";
import { UIText } from "ui/components/common/ui-text";
import { AnchoredModal } from "ui/components/modal/anchored";
import { createSimpleToggleOnClick } from "ui/hooks/useMain";
import { PartyOptionsDropdown } from "./dropdown";

import { Icons } from "lantern-icons";

import "./header.scss";
export function PartyHeader() {
    let party = useRootSelector(state => {
        let active_party = activeParty(state);
        if(active_party) {
            return state.party.parties[active_party];
        }
        return;
    });

    let [show, main_click_props] = createSimpleToggleOnClick();

    return (
        <Show when={party()}>
            <header className="ln-party-header" classList={{ 'active': show() }} {...main_click_props}>
                <div className="ln-party-header__name">
                    <UIText text={party()!.party.name} />
                </div>

                <VectorIcon id={show() ? Icons.MenuClose : Icons.ChevronDown} />

                <AnchoredModal show={show()}>
                    <PartyOptionsDropdown />
                </AnchoredModal>
            </header>
        </Show>
    );
}