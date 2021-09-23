import React from "react";

import classnames from "classnames";

import { Markdown } from "ui/components/common/markdown";

import { Message as MessageModel } from "state/models";

export interface MessageProps {
    editing: boolean,
    msg: MessageModel,
}

import "./msg.scss";
import { ErrorBoundary } from "ui/components/error";
export const Message = React.memo((props: MessageProps) => {
    let classes = classnames("ln-msg", {
        'ln-msg--editing': props.editing
    });

    return (
        <div className={classes}>
            <ErrorBoundary>
                <Markdown body={props.msg.content} />
            </ErrorBoundary>
        </div>
    );
});