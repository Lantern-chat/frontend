import React from 'react';
import * as dayjs from 'dayjs';

import "./board.scss";

import { Message } from "../message";

import "../message/message.scss";

const dummyjs = require("dummyjs").default;

const MESSAGES: any[] = [];

for(let i = 0; i < 50; i++) {
    MESSAGES.push({
        content: dummyjs.text(10, 60),
        time: dayjs(Date.now() + i * 12345),
    });
}

export const MessageBoard = React.memo(() => {
    return (
        <div className="ln-message-container">
            <div className="ln-message-container-main">
                <div className="ln-message-box">
                    <div className="ln-message-wrapper">
                        <ol>
                            {MESSAGES.map((msg, idx) => (
                                <li key={idx} className="ln-message">
                                    <h5>{msg.time.format()}</h5>
                                    <p>{msg.content}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
});
MessageBoard.displayName = "MessageBoard";