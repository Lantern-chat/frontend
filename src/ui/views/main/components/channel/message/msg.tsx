import React from "react";

import { Markdown, MarkdownProps } from "ui/components/common/markdown";

import { IMessage } from "ui/views/main/reducers/messages";

export const Message = (msg: IMessage) => {
    return (
        <div className="ln-msg">
            <Markdown body={msg.msg} />
        </div>
    );
};