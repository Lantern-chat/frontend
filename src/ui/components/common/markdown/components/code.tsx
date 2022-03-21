import { createMemo, Show } from 'solid-js';

import "./code.scss";

import hljs from "highlight.js";

export interface ICodeProps {
    src: string,
    language?: string,
}

function hasLang(lang?: string): string | undefined {
    if(lang && hljs.getLanguage(lang)) {
        return lang;
    }
    return;
}

export default function Code(props: ICodeProps) {
    return (
        <Show when={hasLang(props.language)} fallback={<Text src={props.src} />}>
            {language => <Highlight src={props.src} language={language} />}
        </Show>
    )
}

function ignoreTouch(e: TouchEvent) {
    e.stopPropagation();
}

function Text(props: { src: string }) {
    return (
        <pre className="hljs" onTouchStart={ignoreTouch}>
            <code>{props.src.trim()}</code>
        </pre>
    );
}

function Highlight(props: Required<ICodeProps>) {
    let html = createMemo(() => hljs.highlight(props.src, { language: props.language }).value);

    return (
        <pre className="hljs" onTouchStart={ignoreTouch}>
            <code innerHTML={html()} />
        </pre>
    );
}