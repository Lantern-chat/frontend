import React from "react";

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

const Math = React.memo((props: IMathProps) => {
    let result: string = katex.renderToString(props.src, {
        displayMode: !props.inline,
        strict: false,
        throwOnError: false,
        macros: katexMacros,
        output: 'html',
    });

    let inner_props = {
        dangerouslySetInnerHTML: { __html: result }
    };

    if(props.inline) {
        return <span {...inner_props} />
    } else {
        return <div {...inner_props} />
    }
});

if(__DEV__) {
    Math.displayName = "Math";
}

export default Math;