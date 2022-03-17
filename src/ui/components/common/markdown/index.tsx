import type { JSX } from "solid-js";

import { SolidMarkdown } from "./markdown";
import { SolidMarkdownExtra } from "./extra";

export interface IMarkdownProps {
    source: string,
    className?: string,
    classList?: { [key: string]: boolean },
    extra?: JSX.Element,
}

import "./markdown.scss";

let classes = (cn?: string) => {
    return ["ln-markdown ln-markdown-full", cn].join(' ');
};

export function Markdown(props: IMarkdownProps) {
    return (
        <SolidMarkdownExtra {...props} className={classes(props.className)} />
    );
}

export function SimpleMarkdown(props: IMarkdownProps) {
    return (
        <SolidMarkdown {...props} className={classes(props.className)} />
    );
}