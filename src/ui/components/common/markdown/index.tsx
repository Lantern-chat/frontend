import React from "react";
import { Spinner } from "ui/components/common/spinners/spinner";

import SimpleMarkdown from "./simple";
const AdvancedMarkdown = React.lazy(() => import("./advanced"));

import { MarkdownProps } from "./types";
export { MarkdownProps } from "./types";

const Pre = (props: any) => (<pre className="hljs" {...props} />);
const Div = (props: any) => (<div {...props} />);

export const Markdown = React.memo((props: MarkdownProps) => {
    let is_advanced = /`{3}|\\[\[\(]/.test(props.body);
    const Markdown = is_advanced ? AdvancedMarkdown : SimpleMarkdown;

    // TODO: Escape backslashes before underscores, but also escape the underscore

    let body = props.body
        .replace(/>(.*)\n>/g, '>$1\n>\n>') // always split paragraphs in blockquotes
        .replace(/>{5,}/g, '>>>>>'); // limit blockquote depth to 5

    let fallback = <span />;
    if(is_advanced) {
        let style, Element = Div;

        // for code, we'll know the size based on the newlines,
        // so show the box while loading to prevent multiple layout changes
        if(/`{3}/.test(body)) {
            Element = Pre;
            let newlines = (body.match(/\n/g) || '').length * 1.2; // 1.2 line height for code blocks
            style = { minHeight: newlines + 'em' };
        }

        fallback = (
            <Element style={{ ...style, display: 'flex' }}>
                <div className="ln-center-standalone" style={{ margin: 'auto auto' }}>
                    <Spinner size="2em" />
                </div>
            </Element>
        );
    }

    return (
        <div className="ln-markdown">
            <React.Suspense fallback={fallback}>
                <Markdown body={body} />
            </React.Suspense>
        </div>
    );
});