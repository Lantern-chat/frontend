import React from 'react';

import { CreatePartyModal } from "./create_party";

const MainModals = React.memo(() => {
    return (
        <>
            <CreatePartyModal />
        </>
    );
});

export default MainModals;

if(__DEV__) {
    MainModals.displayName = "MainModals";
}