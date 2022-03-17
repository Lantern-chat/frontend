import { createMemo, JSX, Show } from "solid-js";
import { ErrorBoundary } from "solid-js/web";

import { DisplayError } from "ui/components/common/error";
import { Markdown } from "ui/components/common/markdown";

import { Message as MessageModel } from "state/models";

export interface MessageProps {
    editing?: boolean,
    msg: DeepReadonly<MessageModel>,
    //classList?: { [key: string]: boolean },
    extra?: JSX.Element,
}

import "./msg.scss";
export function Message(props: MessageProps) {
    return (
        <Show when={props.msg.content}>
            <ErrorBoundary fallback={err => <DisplayError error={err} />}>
                <Markdown source={props.msg.content!}
                    className="ln-msg"
                    classList={{ 'ln-msg--editing': !!props.editing }}
                    extra={props.extra}
                />
            </ErrorBoundary>
        </Show>
    );
}