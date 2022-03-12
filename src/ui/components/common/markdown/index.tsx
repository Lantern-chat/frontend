import { SolidMarkdown } from "./markdown";
import { SolidMarkdownExtra } from "./extra";

export interface IMarkdownProps {
    body: string,
    className?: string,
}

import "./markdown.scss";

let classes = (cn?: string) => {
    return ["ln-markdown ln-markdown-full", cn].join(' ');
};

export function Markdown(props: IMarkdownProps) {
    return (
        <SolidMarkdownExtra source={props.body} className={classes(props.className)} />
    );
}

export function SimpleMarkdown(props: IMarkdownProps) {
    return (
        <SolidMarkdown source={props.body} className={classes(props.className)} />
    );
}