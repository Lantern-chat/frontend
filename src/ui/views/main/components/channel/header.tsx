import React from "react";
import { HamburgerMenu } from "ui/components/common/hamburger";

import "./header.scss";
export const ChannelHeader = React.memo(() => {
    return (
        <div className="ln-channel-header">
            <div className="ln-channel-header__hamburger">
                <HamburgerMenu />
            </div>

            Channel Header
        </div>
    );
});