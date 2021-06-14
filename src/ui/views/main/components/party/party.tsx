import React from "react";
import { shallowEqual, useSelector } from "react-redux";

import { ChannelList } from "./channel_list";
import { PartyHeader } from "./party_header";
import { PartyFooter } from "./party_footer";
import { Channel } from "../channel/channel";

import { Snowflake } from "state/main/models";
import { RootState } from "state/main";
import { Panel } from "state/main/reducers/window";

import "./party.scss";
import { useParams } from "react-router";

export const Party = React.memo(() => {
    let show_panel = useSelector((state: RootState) => state.window.show_panel);

    let { party, channel } = useParams<{ party: string, channel: string }>();

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