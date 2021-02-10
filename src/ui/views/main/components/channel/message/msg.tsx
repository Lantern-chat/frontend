import React from "react";

import classnames from "classnames";

import { Markdown, MarkdownProps } from "ui/components/common/markdown";

import { IMessage } from "ui/views/main/state/reducers/messages";

export interface MessageProps extends IMessage {
    editing: boolean,
}

import "./msg.scss";
export const Message = React.memo((props: MessageProps) => {
    let classes = classnames("ln-msg", {
        'ln-msg--editing': props.editing
    });

    return (
        <div className={classes}>
            <Markdown body={props.msg} />
        </div>
    );
});