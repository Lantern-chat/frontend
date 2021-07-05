import React from 'react';
import { useSelector } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { RootState } from 'state/root';

import { CreatePartyModal } from "./create_party";
import { ProfileModal } from './profile';

let modal_selector = createStructuredSelector({
    modals: (state: RootState) => state.modals,
    profile: (state: RootState) => state.history.parts[0] == 'profile',
})

const MainModals = React.memo(() => {
    let { modals, profile } = useSelector(modal_selector);

    return (
        <>
            {modals.create_party_open && <CreatePartyModal />}
            {profile && <ProfileModal />}
        </>
    );
});

export default MainModals;

if(__DEV__) {
    MainModals.displayName = "MainModals";
}