import React from 'react';
import ReactMarkdown from 'react-markdown';
import gfm from 'remark-gfm';

export interface MessageBodyProps {
    content: string,
}

// TODO: Custom remark plugins to parse emotes
export class MessageBody extends React.PureComponent<MessageBodyProps> {
    render() {
        return <ReactMarkdown plugins={[gfm]}>{this.props.content}</ReactMarkdown>;
    }
}

export interface MessageProps {
    body: MessageBodyProps,
    timestamp: any,
    roles: Array<string>,
    username: string,
    displayname: string,
}

export class Message extends React.Component<MessageProps> {
    render() {
        return (<div></div>);
    }
}