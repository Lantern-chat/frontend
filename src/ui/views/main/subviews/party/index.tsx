import { fnv1a } from "client/fnv";
import React from "react";
import { ChannelList } from "./components/channel_list";
import { PartyHeader } from "./components/party_header";

import "./party.scss";
export const Party = () => {
    let channels = ["off-topic-general", "lantern-dev", "meta-discussion", "the-memes", "fanfics"];

    let prefix = "abcdefghijklmnopqrstuvwxyz";

    for(let i = 0; i < 150; i++) {
        let idx = fnv1a((i * 12345).toString()) % prefix.length;
        channels.push(prefix.charAt(idx) + "est-channel-" + i);
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