import { JSX, Show } from "solid-js";
import { ErrorBoundary } from "solid-js/web";

import { DisplayError } from "ui/components/common/error";
import { Markdown } from "ui/components/common/markdown";

import { Message as MessageModel } from "state/models";

export interface MessageProps {
    editing?: boolean,
    msg: MessageModel,
    //classList?: { [key: string]: boolean },
    extra?: JSX.Element,
    hide?: boolean
}

// TODO: If keyed, test if source can be /*@once*/
import "./msg.scss";
export function Message(props: MessageProps) {
    return (
        <Show keyed when={!props.hide && props.msg.content}>
            {content => (
                <Markdown source={content}
                    class="ln-msg"
                    classList={{ 'ln-msg--editing': !!props.editing }}
                    extra={props.extra}
                />
            )}
        </Show>
    );
}