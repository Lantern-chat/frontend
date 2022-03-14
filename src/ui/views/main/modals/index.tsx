import { Show } from 'solid-js';
import { useStructuredSelector } from 'solid-mutant';

import { RootState } from 'state/root';

import { CreatePartyModal } from "./create_party";
import { SettingsModal } from './settings';

export default function MainModals() {
    let state = useStructuredSelector({
        modals: (state: RootState) => state.modals,
        settings: (state: RootState) => state.history.parts[0] == 'settings',
    });

    return (
        <>
            <Show when={state.modals.create_party_open}>
                <CreatePartyModal />
            </Show>

            <Show when={state.settings}>
                <SettingsModal />
            </Show>
        </>
    );
}