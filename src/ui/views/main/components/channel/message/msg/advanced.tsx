import React from "react";

import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm';

import SyntaxHighlighter from 'react-syntax-highlighter'

import Tex from '@matejmazur/react-katex';
import "katex/contrib/mhchem/mhchem";
import math from 'remark-math';

import 'katex/dist/katex.min.css'
import "./code.scss";

import { MessageProps } from "./types";

const renderers = {
    code: ({ language, value }: { language: string, value: string }) => {
        return <SyntaxHighlighter useInlineStyles={false} language={language} children={value} />
    },
    inlineMath: ({ value }: { value: string }) => <Tex math={value} />,
    math: ({ value }: { value: string }) => <Tex block math={value} />,
};

export const AdvancedMessage = (props: MessageProps) => {
    let msg = props.msg
        .replace(/\$/g, '\\$') // escape $ symbols
        .replace(/(?<=\\\[[^]*)(\\\$)(?=[^]*?\\\])/g, '$$') // unescape $ symbols within block delimiters
        .replace(/\\[\[\]]/g, '$$$$') // escape block
        .replace(/\\[\(\)]/g, '$$'); // escape inline

    return <ReactMarkdown plugins={[gfm, math]} renderers={renderers} children={msg} />;
};
export default AdvancedMessage;