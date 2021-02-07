import { fnv1a } from "client/fnv";
import React from "react";
import { ChannelList } from "ui/views/main/components/party/channel_list";
import { PartyHeader } from "ui/views/main/components/party/party_header";
import { Channel } from "../channel/channel";
import { ChannelBody } from "../channel/body";
import { ChannelHeader } from "../channel/header";

import "./party.scss";
export const Party = () => {
    let channels = ["off-topic-general", "lantern-dev", "meta-discussion", "the-memes", "fanfics"];

    let prefix = "abcdefghijklmnopqrstuvwxyz";

    for(let i = 0; i < 150; i++) {
        let idx = fnv1a((i * 12345).toString()) % prefix.length;
        channels.push(prefix.charAt(idx) + "est-channel-" + i);
    }

    return (
        <div className="ln-party">
            <div className="ln-party__sidebar">
                <PartyHeader />
                <ChannelList channels={channels} />
            </div>
            <div className="ln-party__channel">
                <Channel />
            </div>
        </div>
    );
};