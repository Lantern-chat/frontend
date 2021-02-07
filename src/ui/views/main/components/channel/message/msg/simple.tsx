import React from "react";

import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm';

import "./markdown.scss";

import { MessageProps } from "./types";

export const SimpleMessage = (props: MessageProps) => {
    return <ReactMarkdown plugins={[gfm]} children={props.msg} />
};
export default SimpleMessage;