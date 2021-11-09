import React from "react";

import classnames from "classnames";

import { Markdown } from "ui/components/common/markdown";

import { Message as MessageModel } from "state/models";

export interface MessageProps {
    editing: boolean,
    msg: MessageModel,
    className?: string,
    extra?: string,
}

import "./msg.scss";
import { ErrorBoundary } from "ui/components/error";
export const Message = React.memo((props: MessageProps) => {
    let content = props.msg.content;
    if(!content) {
        return null;
    }

    if(props.extra) {
        content += props.extra;
    }

    let classes = classnames("ln-msg", {
        'ln-msg--editing': props.editing
    }, props.className);

    return (
        <ErrorBoundary>
            <Markdown body={content} className={classes} />
        </ErrorBoundary>
    );
});