import React from "react";
import { shallowEqual, useSelector } from "react-redux";

import { fnv1a } from "client/fnv";

import { ChannelList } from "ui/views/main/components/party/channel_list";
import { PartyHeader } from "ui/views/main/components/party/party_header";
import { Channel } from "../channel/channel";

import { RootState } from "ui/views/main/state";
import { Panel } from "ui/views/main/state/reducers/window";

import "./party.scss";
export const Party = React.memo(() => {
    let channels = ["off-topic-general", "lantern-dev", "meta-discussion", "the-memes", "fanfics"];

    let prefix = "abcdefghijklmnopqrstuvwxyz";

    for(let i = 0; i < 150; i++) {
        let idx = fnv1a((i * 12345).toString()) % prefix.length;
        channels.push(prefix.charAt(idx) + "est-channel-" + i);
    }

    let [show_panel, use_mobile_view] = useSelector((state: RootState) =>
        [state.window.show_panel, state.window.use_mobile_view], shallowEqual);

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
                <ChannelList channels={channels} />
            </div>
            <div className={classes.join(' ')}>
                <Channel />
            </div>
        </div>
    );
});