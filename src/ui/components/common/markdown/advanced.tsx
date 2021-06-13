import React from "react";

import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm';
import breaks from 'remark-breaks';
import external from 'remark-external-links';

import SyntaxHighlighter from 'react-syntax-highlighter'

import "katex/contrib/mhchem/mhchem";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

import 'katex/dist/katex.min.css'
import "./advanced.scss";

import { MarkdownProps } from "./types";

import { renderers as simple_renderers } from "./simple";

const renderers = {
    ...simple_renderers,
    code: ({ node, inline, className, ...props }: any) => {
        console.log({ node, inline, className, ...props });

        if(inline === true) {
            return <code {...props} />;
        } else {
            let language = className, src = props.children;

            if(typeof language === 'string') {
                language = language.slice('language-'.length);
            }

            if(Array.isArray(src)) {
                src = src.join('\n');
            }

            src = src.trim();

            return <SyntaxHighlighter useInlineStyles={false} language={language} children={src} />;
        }
    },
    pre: ({ children }: any) => (<>{children}</>),
};

export const AdvancedMarkdown = (props: MarkdownProps) => {
    let body = props.body
        .replace(/\$/g, '\\$') // escape $ symbols
        .replace(/(?<=\\\[[^]*)(\\\$)(?=[^]*?\\\])/g, '$$') // unescape $ symbols within block delimiters
        .replace(/\\[\[\]]/g, '$$$$') // escape block
        .replace(/\\[\(\)]/g, '$$'); // escape inline

    return <ReactMarkdown remarkPlugins={[gfm, remarkMath, breaks, external]} rehypePlugins={[rehypeKatex]} components={renderers} children={body} />;
};
export default AdvancedMarkdown;

if(process.env.NODE_ENV !== 'production') {
    AdvancedMarkdown.displayName = "AdvancedMarkdown";
}