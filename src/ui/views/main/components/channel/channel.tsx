import React from "react";

import "./channel.scss";
import { ChannelBody } from "./body";
import { ChannelHeader } from "./header";
import { MessageList } from "./message/list";
import { MessageBox } from "./message/box";

export const Channel = React.memo(() => {
    return (
        <div className="ln-channel">
            <ChannelHeader />
            <MessageList />
            <MessageBox />
        </div>
    );
});