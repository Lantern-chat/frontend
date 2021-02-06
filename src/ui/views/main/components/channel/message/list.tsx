import React from "react";

const dummyjs = require("dummyjs").default;

import "./list.scss"
export const MessageList = React.memo(() => {
    let messages = [];
    for(let i = 0; i < 200; i++) {
        messages.push({
            id: i,
            msg: dummyjs.text(4, 40),
        });
    }

    return (
        <div className="ln-msg-list__flex-container">
            <div className="ln-msg-list__wrapper ln-scroll-y ln-scroll-fixed">
                <ul className="ln-msg-list">
                    {messages.map((msg, i) => (
                        <li key={i} className="ln-msg">
                            {msg.msg}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
});