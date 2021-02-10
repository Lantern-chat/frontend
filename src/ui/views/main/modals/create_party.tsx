import React from "react";
import { useSelector } from "react-redux";

import { Modal } from "ui/components/modal";
import { RootState } from "../state";

export const CreatePartyModal = React.memo(() => {
    let open = useSelector((state: RootState) => state.modals.create_party_open);

    if(!open) {
        return null;
    }

    return (
        <Modal>
            <div>Testing</div>
        </Modal>
    );
});