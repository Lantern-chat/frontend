import React from "react";

import { ReactMarkdown } from "./markdown";
import { ReactMarkdownExtra } from "./extra";

export interface IMarkdownProps {
    body: string,
}

import "./markdown.scss";
export const Markdown = React.memo(({ body }: IMarkdownProps) => {
    return (
        <ReactMarkdownExtra source={body} className="ln-markdown ln-markdown-full" />
    );
});

export const SimpleMarkdown = React.memo(({ body }: IMarkdownProps) => {
    return (
        <ReactMarkdown source={body} className="ln-markdown ln-markdown-full" />
    );
});

if(__DEV__) {
    Markdown.displayName = "MarkdownWrapper";
    SimpleMarkdown.displayName = "SimpleMarkdownWrapper";
}