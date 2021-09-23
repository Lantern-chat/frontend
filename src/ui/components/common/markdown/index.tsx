import React from "react";

import { ReactMarkdown } from "./markdown";

import "./markdown.scss";
export const Markdown = React.memo(({ body }: { body: string }) => {
    // TODO: Escape backslashes before underscores, but also escape the underscore
    // TODO: Only apply these tweaks outside of code blocks
    body = body
        .replace(/^>(?=[^\s>])/g, '\\>') // change emotes like >.< to \>.< automatically
        .replace(/^>\s(.*)\n>/g, '>$1\n>\n>') // always split paragraphs in blockquotes
        .replace(/^>{5,}/g, '>>>>>'); // limit blockquote depth to 5

    return (
        <div className="ln-markdown">
            <ReactMarkdown source={body} />
        </div>
    );
});