import { Show } from "solid-js";
import { useRootSelector } from "state/root";
import { activeParty } from "state/selectors/active";

import { VectorIcon } from "ui/components/common/icon";
import { UIText } from "ui/components/common/ui-text";
import { PartyOptionsDropdown } from "./dropdown";

import { BalloonsIcon } from "lantern-icons";
import { ChevronDownIcon, MenuCloseIcon } from "lantern-icons";


import "./header.scss";
import { AnchoredModal } from "ui/components/modal/anchored";
import { createSimpleToggleOnClick } from "ui/hooks/useMain";
export function PartyHeader() {
    let party = useRootSelector(state => {
        let active_party = activeParty(state);
        if(active_party) {
            return state.party.parties[active_party];
        }
        return;
    });

    let [show, main_click_props] = createSimpleToggleOnClick();

    console.log("MAIN CLICK PROPS", main_click_props);

    return (
        <Show when={party()}>
            <header className="ln-party-header" {...main_click_props}>
                <div className="ln-party-header__name">
                    <UIText text={party()!.party.name} />
                </div>

                <VectorIcon src={show() ? MenuCloseIcon : ChevronDownIcon} />

                <AnchoredModal show={show()}>
                    <PartyOptionsDropdown />
                </AnchoredModal>
            </header>
        </Show>
    );
}