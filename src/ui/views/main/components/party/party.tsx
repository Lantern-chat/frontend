import React from "react";

import { shallowEqual, useSelector } from "react-redux";

import { ChannelList } from "./channel_list";
import { PartyHeader } from "./party_header";
import { PartyFooter } from "./party_footer";
import { Channel } from "../channel/channel";

import { Snowflake } from "state/models";
import { RootState } from "state/root";
import { Panel } from "state/reducers/window";

import "./party.scss";
import { createStructuredSelector } from "reselect";

let party_selector = createStructuredSelector({
    party: (state: RootState) => state.history.parts[1],
    channel: (state: RootState) => state.history.parts[2],
    show_panel: (state: RootState) => state.window.show_panel,
})

export const Party = React.memo(() => {
    let { show_panel, party, channel } = useSelector(party_selector);

    let classes = ["ln-party__channel"];
    switch(show_panel) {
        case Panel.RightSidebar: {
            classes.push(classes[0] + '--expanded');
        }
    }

    return (
        <div className="ln-party">
            <div className="ln-party__sidebar">
                <PartyHeader />
                <ChannelList />
                <PartyFooter />
            </div>
            <div className={classes.join(' ')}>
                <Channel party={party} channel={channel} />
            </div>
        </div>
    );
});