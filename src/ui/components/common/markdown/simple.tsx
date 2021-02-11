import React from "react";

import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm';
import breaks from 'remark-breaks';
import external from 'remark-external-links';

import "./markdown.scss";

import { MarkdownProps } from "./types";

export const renderers = {
    link: ({ href, children }: { href: string, children: React.ReactNode }) => (
        <a target="_blank" href={href}>{children}</a>
    )
};

export const SimpleMarkdown: React.FunctionComponent<MarkdownProps> = (props: MarkdownProps) => {
    return <ReactMarkdown plugins={[gfm, breaks, external]} children={props.body} renderers={renderers} />
};
export default SimpleMarkdown;

if(process.env.NODE_ENV !== 'production') {
    SimpleMarkdown.displayName = "SimpleMarkdown";
}