import React from "react";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { RootState } from "state/root";
import { activeParty } from "state/selectors/active";

import { VectorIcon } from "ui/components/common/icon";

import { BalloonsIcon } from "ui/assets/icons";

const party_selector = createSelector(
    activeParty,
    (state: RootState) => state.party.parties,
    (active_party, parties) => {
        return active_party && parties.get(active_party);
    }
)

import "./party_header.scss";
export const PartyHeader = React.memo(() => {
    let party = useSelector(party_selector);

    if(!party) return null;

    return (
        <header className="ln-party-header">
            <div className="ln-party-header__name">
                <span className="ui-text">{party.party.name}</span>
            </div>
            <VectorIcon src={Balloons} />
        </header>
    );
});