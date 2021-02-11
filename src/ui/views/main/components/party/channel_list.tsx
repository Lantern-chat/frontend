import React from "react";

import { fnv1a } from "client/fnv";

import { Glyphicon } from "ui/components/common/glyphicon";
import { Avatar } from "ui/components/common/avatar";

import Hash from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-740-hash.svg";

const colors = ['yellow', 'lightblue', 'lightgreen', 'lightcoral', 'orange', 'plum'];


const ListedChannel = React.memo(({ channel, i }: { channel: string, i: number }) => {
    let name_hash = fnv1a(channel);

    return (
        <li key={channel}>
            <div className="ln-channel-list__channel">
                <div className="ln-channel-list__icon">
                    {name_hash % 2 == 0 ?
                        <Avatar url={`https://placekitten.com/${(i % 25) + 25}/${(i % 25) + 25}`} username={channel} backgroundColor={colors[name_hash % colors.length]} /> :
                        <Glyphicon src={Hash} />}
                </div>
                <div className="ln-channel-list__name"><span>{channel}</span></div>
            </div>
        </li>
    );
});

import "./channel_list.scss";
export const ChannelList = React.memo(() => {
    let channels = ["off-topic-general", "lantern-dev", "meta-discussion", "the-memes", "fanfics"];

    let prefix = "abcdefghijklmnopqrstuvwxyz";

    for(let i = 0; i < 150; i++) {
        let idx = fnv1a((i * 12345).toString()) % prefix.length;
        channels.push(prefix.charAt(idx) + "est-channel-" + i);
    }

    return (
        <ul className="ln-channel-list ln-scroll-y ln-scroll-fixed">
            {channels.map((channel, i) => <ListedChannel key={channel} channel={channel} i={i} />)}
        </ul>
    );
});