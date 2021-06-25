import React from "react";

import "./channel.scss";
import { ChannelHeader } from "./header";
import { MessageFeed } from "./message/feed";
import { MessageBox } from "./message/box";
import { Snowflake } from "state/models";

export interface IChannelProps {
    channel?: Snowflake,
    party: Snowflake,
}

export const Channel = React.memo((props: IChannelProps) => {
    let feed_box;
    if(props.channel) {
        feed_box = <MessageFeed channel={props.channel} />;
    } else {
        // TODO: Replace with fake CSS channel?
        feed_box = <div className="ln-center-standalone">Loading...</div>;
    }

    return (
        <div className="ln-channel">
            <ChannelHeader />
            {feed_box}
            <MessageBox disabled={!props.channel} />
        </div>
    );
});