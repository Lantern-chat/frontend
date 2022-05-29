import type { JSX } from "solid-js";

import { SolidMarkdown } from "./markdown";
import { SolidMarkdownExtra } from "./extra";

export interface IMarkdownProps {
    source: string,
    class?: string,
    classList?: { [key: string]: boolean },
    extra?: JSX.Element,
}

import "./markdown.scss";

let classes = (cn?: string) => {
    return ["ln-markdown ln-markdown-full", cn].join(' ');
};

export function Markdown(props: IMarkdownProps) {
    return (
        <SolidMarkdownExtra {...props} class={classes(props.class)} />
    );
}

export function SimpleMarkdown(props: IMarkdownProps) {
    return (
        <SolidMarkdown {...props} class={classes(props.class)} />
    );
}