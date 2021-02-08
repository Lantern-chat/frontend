import React from "react";

import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm';

import "./markdown.scss";

import { MarkdownProps } from "./types";

export const SimpleMarkdown: React.FunctionComponent<MarkdownProps> = (props: MarkdownProps) => {
    return <ReactMarkdown plugins={[gfm]} children={props.body} />
};
export default SimpleMarkdown;

if(process.env.NODE_ENV !== 'production') {
    SimpleMarkdown.displayName = "SimpleMarkdown";
}