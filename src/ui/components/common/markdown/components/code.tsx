import { Show } from 'solid-js';

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
        <Show when={hasLang(props.language)} fallback={<Text src={/* @once */props.src} />}>
            {language => <Highlight src={/* @once */props.src} language={/* @once */language} />}
        </Show>
    )
}

function ignoreTouch(e: TouchEvent) {
    e.stopPropagation();
}

function Text(props: { src: string }) {
    return (
        <pre class="hljs" onTouchStart={ignoreTouch}>
            <code textContent={/* @once */props.src.trim()} />
        </pre>
    );
}

function Highlight(props: Required<ICodeProps>) {
    let html = () => hljs.highlight(props.src, { language: props.language }).value;

    return (
        <pre class="hljs" onTouchStart={ignoreTouch}>
            <code innerHTML={/* @once */html()} />
        </pre>
    );
}