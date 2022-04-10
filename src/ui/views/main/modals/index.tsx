import { Show } from 'solid-js';
import { useStructuredSelector } from 'solid-mutant';

import { RootState } from 'state/root';

import { SettingsModal } from './settings';

export default function MainModals() {
    let state = useStructuredSelector({
        settings: (state: RootState) => state.history.parts[0] == 'settings',
    });

    return (
        <>
            <Show when={state.settings}>
                <SettingsModal />
            </Show>
        </>
    );
}