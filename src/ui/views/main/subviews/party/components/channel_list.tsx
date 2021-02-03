import React from "react";

export interface IChannelListProps {
    channels: string[],
}

import Hash from "icons/glyphicons-pro/glyphicons-basic-2-3/svg/individual-svg/glyphicons-basic-740-hash.svg";
import { Glyphicon } from "ui/components/common/glyphicon";
import { Avatar } from "ui/components/common/avatar";

import "./channel_list.scss";
import { fnv1a } from "client/fnv";
export const ChannelList = React.memo((props: IChannelListProps) => {
    let colors = ['yellow', 'lightblue', 'lightgreen', 'lightcoral', 'orange', 'plum'];

    return (
        <ul className="ln-channel-list ln-vertical-scroll ln-scroll-fixed">
            {props.channels.map((channel, i) => {
                let name_hash = fnv1a(channel);

                return <li key={channel}>
                    <div className="ln-channel-list-channel">
                        <div className="ln-channel-list-icon">
                            {name_hash % 2 == 0 ?
                                <Avatar url={`https://placekitten.com/${(i % 25) + 25}/${(i % 25) + 25}`} username={channel} backgroundColor={colors[name_hash % colors.length]} /> :
                                <Glyphicon src={Hash} />}
                        </div>
                        <div className="ln-channel-list-name"><span>{channel}</span></div>
                    </div>
                </li>
            })}
        </ul>
    );
});