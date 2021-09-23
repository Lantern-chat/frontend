import React from "react";

import "./markdown.scss";

import { MarkdownProps } from "./types";

//import spoiler from "./plugins/spoiler";

import { ReactMarkdown } from "./markdown";

export const SimpleMarkdown: React.FunctionComponent<MarkdownProps> = (props: MarkdownProps) => {
    return <ReactMarkdown source={props.body} />
};
export default SimpleMarkdown;

if(__DEV__) {
    SimpleMarkdown.displayName = "SimpleMarkdown";
}