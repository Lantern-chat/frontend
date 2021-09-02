import React from "react";
import { useSelector } from "react-redux";
import { createSelector } from "reselect";
import { RootState } from "state/root";
import { activeParty } from "state/selectors/active";

import { Glyphicon } from "ui/components/common/glyphicon";

import Balloons from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-883-balloons.svg";

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
                <span>{party.party.name}</span>
            </div>
            <Glyphicon src={Balloons} />
        </header>
    );
});