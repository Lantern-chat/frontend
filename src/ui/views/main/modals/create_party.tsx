import { useDispatch } from "solid-mutant";

import { RootState, Type } from "state/root";
import { GenericModal } from "./generic";

export function CreatePartyModal() {
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
}