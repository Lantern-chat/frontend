import React from "react";

export interface IChannelListProps {
    channels: string[],
}

import Hash from "icons/glyphicons-pro/glyphicons-basic-2-3/svg/individual-svg/glyphicons-basic-740-hash.svg";
import { Glyphicon } from "ui/components/common/glyphicon";
import { Avatar } from "ui/components/common/avatar";

import "./channel_list.scss";
export const ChannelList = React.memo((props: IChannelListProps) => {
    let colors = ['yellow', 'lightblue', 'lightgreen', 'lightcoral'];

    return (
        <ul className="ln-channel-list ln-vertical-scroll">
            {props.channels.map((channel, i) => (
                <li key={channel} className="ln-channel-list-channel">
                    <Avatar text={channel.slice(0, 1)} username={channel} backgroundColor={colors[(i * 7919) % 4]} />
                    <Glyphicon src={Hash} />
                    <span className="ln-channel-list-name">{channel}</span>
                </li>
            ))}
        </ul>
    );
});