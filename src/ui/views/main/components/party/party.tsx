import React from "react";
import { shallowEqual, useSelector } from "react-redux";

import { ChannelList } from "./channel_list";
import { PartyHeader } from "./party_header";
import { PartyFooter } from "./party_footer";
import { Channel } from "../channel/channel";

import { RootState } from "ui/views/main/state";
import { Panel } from "ui/views/main/state/state/window";

import "./party.scss";
export const Party = React.memo(() => {
    let show_panel = useSelector((state: RootState) => state.window.show_panel);

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
                <Channel />
            </div>
        </div>
    );
});