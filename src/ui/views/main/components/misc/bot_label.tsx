import React from "react"

import "./bot_label.scss";
export const BotLabel = React.memo(() => {
    return (
        <span className="bot-label" title="Bot">
            <span className="ui-text">Bot</span>
        </span>
    );
});

if(__DEV__) {
    BotLabel.displayName = "BotLabel";
}