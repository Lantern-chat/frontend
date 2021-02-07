import React from "react";
import { Spinner } from "ui/components/common/spinners/spinner";

import SimpleMessage from "./simple";
const AdvancedMessage = React.lazy(() => import("./advanced"));

import { MessageProps } from "./types";


export const Message = React.memo((props: MessageProps) => {
    const Message = /`{3}|\\[\[\(]/.test(props.msg) ? AdvancedMessage : SimpleMessage;

    // always split paragraphs in blockquotes
    let msg = props.msg.replace(/>(.*)\n>/g, '>$1\n>\n>');

    return (
        <React.Suspense fallback={<Spinner size="2em" />}>
            <Message msg={msg} />
        </React.Suspense>
    )
});