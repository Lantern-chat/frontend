import React from "react";

import { Markdown, MarkdownProps } from "ui/components/common/markdown";

import { IMessage } from "ui/views/main/reducers/messages";

export interface MessageProps extends IMessage {
    editing: boolean,
}

import "./msg.scss";
export const Message = React.memo((props: MessageProps) => {
    let className = "ln-msg";
    if(props.editing) {
        className += " ln-msg--editing";
    }

    return (
        <div className={className}>
            <Markdown body={props.msg} />
        </div>
    );
});