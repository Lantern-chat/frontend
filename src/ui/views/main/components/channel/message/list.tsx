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
        <div className="ln-message__container ln-scroll-y ln-scroll-fixed">
            <ul className="ln-message__list">
                {messages.map((msg, i) => (
                    <li key={i} className="ln-message">
                        {msg.msg}
                    </li>
                ))}
            </ul>
        </div>
    );
});