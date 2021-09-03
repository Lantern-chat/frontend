import React from 'react';
import { useSelector } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { RootState } from 'state/root';

import { CreatePartyModal } from "./create_party";
import { SettingsModal } from './settings';

let modal_selector = createStructuredSelector({
    modals: (state: RootState) => state.modals,
    settings: (state: RootState) => state.history.parts[0] == 'settings',
})

const MainModals = React.memo(() => {
    let { modals, settings } = useSelector(modal_selector);

    return (
        <>
            {modals.create_party_open && <CreatePartyModal />}
            {settings && <SettingsModal />}
        </>
    );
});

export default MainModals;

if(__DEV__) {
    MainModals.displayName = "MainModals";
}