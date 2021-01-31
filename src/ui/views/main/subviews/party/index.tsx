import React from "react";
import { ChannelList } from "./components/channel_list";

import "./party.scss";
export const Party = () => {
    return (
        <div className="ln-party-container">
            <ChannelList channels={["off-topic-general", "lantern-dev", "meta-discussion", "sfw-memes", "fics-adult"]} />
        </div>
    );
};