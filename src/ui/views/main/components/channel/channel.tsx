import React from "react";

import "./channel.scss";
import { ChannelHeader } from "./header";
import { MessageFeed } from "./message/feed";
import { MessageBox } from "./message/box";
import { Snowflake } from "state/main/models";

export interface IChannelProps {
    channel: Snowflake,
    party: Snowflake,
}

export const Channel = React.memo((props: IChannelProps) => {
    return (
        <div className="ln-channel">
            <ChannelHeader />
            <MessageFeed channel={props.channel} />
            <MessageBox />
        </div>
    );
});