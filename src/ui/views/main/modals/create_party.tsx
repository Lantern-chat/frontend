import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "models/main";
import { closeCreatePartyModal } from 'models/main/actions/modals';
import { GenericModal } from "./generic";

export const CreatePartyModal = React.memo(() => {
    let open = useSelector((state: RootState) => state.modals.create_party_open);
    let dispatch = useDispatch();

    if(!open) {
        return null;
    }

    return (
        <GenericModal onClose={() => dispatch(closeCreatePartyModal())}>
            <h4>Create of Join a Party</h4>
            <ul>
                <li></li>
            </ul>
            This modal is a WIP
        </GenericModal>
    );
});