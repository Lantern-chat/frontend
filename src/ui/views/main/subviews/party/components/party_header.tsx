import React from "react";

import { Glyphicon } from "ui/components/common/glyphicon";

import Balloons from "icons/glyphicons-pro/glyphicons-basic-2-3/svg/individual-svg/glyphicons-basic-883-balloons.svg";

import "./party_header.scss";
export const PartyHeader = React.memo(() => {
    return (
        <header className="ln-channel-list-header">
            Party Header
            <Glyphicon src={Balloons} />
        </header>
    );
});