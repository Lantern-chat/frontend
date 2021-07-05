import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootState, Type } from "state/root";
import { GenericModal } from "./generic";

export const CreatePartyModal = React.memo(() => {
    let dispatch = useDispatch();

    return (
        <GenericModal onClose={() => dispatch({ type: Type.MODAL_CLOSE_CREATE_PARTY })}>
            <h4>Join or Start a Party</h4>
            <ul>
                <li></li>
            </ul>
            This modal is a WIP
        </GenericModal>
    );
});