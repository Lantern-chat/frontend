import React from "react";
import { ChannelList } from "./components/channel_list";
import { PartyHeader } from "./components/party_header";

import "./party.scss";
export const Party = () => {
    let channels = ["off-topic-general", "lantern-dev", "meta-discussion", "sfw-memes", "fics-adult"];

    for(let i = 0; i < 15; i++) {
        channels.push("some-channel-" + i);
    }

    return (
        <div className="ln-party-container">
            <div className="ln-channel-list-container">
                <PartyHeader />
                <ChannelList channels={channels} />
            </div>
        </div>
    );
};