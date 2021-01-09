import React from 'react';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';

import "./message.scss";

export interface MessageBodyProps {
    content: string,
}

// TODO: Custom remark plugins to parse emotes
export const MessageBody = React.memo((props: MessageBodyProps) => (
    <ReactMarkdown plugins={[gfm]}>{props.content}</ReactMarkdown>
));

export interface MessageProps {
    body: MessageBodyProps,
    timestamp: any,
    username: string,
    displayname: string,
}

export const Message = React.memo((props: MessageProps) => {
    return (
        <div className="ln-message">
            <MessageBody {...props.body} />
        </div>
    );
});