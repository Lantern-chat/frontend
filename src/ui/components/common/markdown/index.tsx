import React from "react";

import { ReactMarkdown } from "./markdown";
import { ReactMarkdownExtra } from "./extra";

export interface IMarkdownProps {
    body: string,
    className?: string,
}

import "./markdown.scss";
export const Markdown = React.memo((props: IMarkdownProps) => {
    let className = "ln-markdown ln-markdown-full ";

    if(props.className) {
        className += props.className;
    }

    return (
        <ReactMarkdownExtra source={props.body} className={className} />
    );
});

export const SimpleMarkdown = React.memo((props: IMarkdownProps) => {
    let className = "ln-markdown ln-markdown-full ";

    if(props.className) {
        className += props.className;
    }

    return (
        <ReactMarkdown source={props.body} className={className} />
    );
});

if(__DEV__) {
    Markdown.displayName = "MarkdownWrapper";
    SimpleMarkdown.displayName = "SimpleMarkdownWrapper";
}