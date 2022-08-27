import { Dynamic } from 'solid-js/web';

import katex from 'katex';

import 'katex/dist/katex.min.css';
import "katex/contrib/mhchem/mhchem";

// TODO: https://vincenttam.gitlab.io/js/katex-macros.js
const katexMacros: any = {
    '\\f': '#1f(#2)',
    "\\dirac": "\\operatorname{\\delta}\\left(#1\\right)",
    "\\scalarprod": "\\left\\langle#1,#2\\right\\rangle",
};

export interface IMathProps {
    src: string,
    inline?: boolean,
}

import "./math.scss";
export default function Math(props: IMathProps) {
    let html = () => katex.renderToString(props.src, {
        displayMode: !props.inline,
        strict: false,
        throwOnError: false,
        macros: katexMacros,
        output: 'htmlAndMathml',
        maxSize: 5,
    });

    return <Dynamic component={props.inline ? 'span' : 'div'} innerHTML={/* @once */html()} />;
}