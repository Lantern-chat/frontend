import { createMemo, Show } from "solid-js";
import { ErrorBoundary } from "solid-js/web";

import { DisplayError } from "ui/components/common/error";
import { Markdown } from "ui/components/common/markdown";

import { Message as MessageModel } from "state/models";

export interface MessageProps {
    editing?: boolean,
    msg: DeepReadonly<MessageModel>,
    //classList?: { [key: string]: boolean },
    extra?: string,
}

import "./msg.scss";
export function Message(props: MessageProps) {
    let content = createMemo(() => {
        let content = props.msg.content;
        if(content && props.extra) {
            content += props.extra;
        }
        return content;
    });

    return (
        <Show when={content()}>
            <ErrorBoundary fallback={err => <DisplayError error={err} />}>
                <Markdown body={content()!}
                    className="ln-msg"
                    classList={{ 'ln-msg--editing': !!props.editing }} />
            </ErrorBoundary>
        </Show>
    );
}