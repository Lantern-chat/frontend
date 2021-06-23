import React from "react";

import { Components } from 'react-markdown/src/ast-to-react';

import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm';
import breaks from 'remark-breaks';
import external from 'remark-external-links';

import "./markdown.scss";

import { MarkdownProps } from "./types";

export const renderers: Components = {
    a: ({ node, ...props }) => (<a target="_blank" {...props} />),
};

export const SimpleMarkdown: React.FunctionComponent<MarkdownProps> = (props: MarkdownProps) => {
    return <ReactMarkdown remarkPlugins={[gfm, breaks, external]} children={props.body} components={renderers} />
};
export default SimpleMarkdown;

if(__DEV__) {
    SimpleMarkdown.displayName = "SimpleMarkdown";
}