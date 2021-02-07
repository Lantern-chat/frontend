import React, { useContext } from "react";
import { useSelector } from "react-redux";
import { IMessageStore } from "ui/views/main/reducers/messages";
import { RootState } from "ui/views/main/reducers";

import { Message } from "./msg";

import "./list.scss";
export const MessageList = React.memo(() => {
    let { messages }: IMessageStore = useSelector((state: RootState) => state.messages);

    return (
        <div className="ln-msg-list__flex-container">
            <div className="ln-msg-list__wrapper ln-scroll-y ln-scroll-fixed">
                <ul className="ln-msg-list">
                    {messages.map(msg => (
                        <li key={msg.id} className="ln-msg">
                            <Message msg={msg.msg} />
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
});