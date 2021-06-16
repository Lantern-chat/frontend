import React from "react";

import classnames from "classnames";

import { Markdown, MarkdownProps } from "ui/components/common/markdown";

import { Message as MessageModel } from "state/main/models";

export interface MessageProps {
    editing: boolean,
    msg: MessageModel,
}

import "./msg.scss";
export const Message = React.memo((props: MessageProps) => {
    let classes = classnames("ln-msg", {
        'ln-msg--editing': props.editing
    });

    return (
        <div className={classes}>
            <Markdown body={props.msg.content} />
        </div>
    );
});