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
import { PartySettings } from "ui/views/main/modals/settings/party-settings";
interface IPartyHeaderProps {
    on_return: () => void,
}
export function PartyHeader(props: IPartyHeaderProps) {
    let party = useRootSelector(state => {
        let active_party = activeParty(state);
        if(active_party) {
            return state.party.parties[active_party];
        }
        return;
    });

    let [show, main_click_props] = createSimpleToggleOnClick();
    let [showingPartySettings, setShowPartySettings] = createSignal(false);

    const showPartySettings = () => setShowPartySettings(true);
    const closePartySettings = () => setShowPartySettings(false);

    return (
        <Show when={party()}>
            <header class="ln-party-header" classList={{ 'active': show() }} {...main_click_props}>
                <div class="ln-party-header__name">
                    <UIText text={party()!.party.name} />
                </div>

                <VectorIcon id={show() ? Icons.Close : Icons.ChevronDown} />

                <AnchoredModal show={!showingPartySettings() && show()}>
                    <PartyOptionsDropdown {...props} showPartySettings={showPartySettings} />
                </AnchoredModal>
                <Show when={showingPartySettings()}>
                    <PartySettings {...props} closePartySettings={closePartySettings} />
                </Show>
            </header>
        </Show>
    );
}