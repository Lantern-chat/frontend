import React from "react";
import { ICodeProps } from "./components/code";
import { IMathProps } from "./components/math";

const LazyMath = React.lazy(() => import(/* webpackChunkName: 'MarkdownMath' */"./components/math"));
const LazyCode = React.lazy(() => import(/* webpackChunkName: 'MarkdownCode' */"./components/code"));

const MathFallback = React.memo((props: IMathProps) => {
    let inner = <code>{props.src}</code>;
    return props.inline ? inner : <pre>{inner}</pre>;
});

const CodeFallback = React.memo((props: ICodeProps) => {
    return <pre className="hljs"><code style={{ whiteSpace: 'pre' }}>{props.src}</code></pre>
});

export const Math = (props: IMathProps) => (
    <React.Suspense fallback={<MathFallback {...props} />}>
        <LazyMath {...props} />
    </React.Suspense>
);

export const Code = (props: ICodeProps) => (
    <React.Suspense fallback={<CodeFallback {...props} />}>
        <LazyCode {...props} />
    </React.Suspense>
);

if(__DEV__) {
    MathFallback.displayName = "MathFallback";
    CodeFallback.displayName = "CodeFallback";
    Math.displayName = "LazyMath";
    Code.displayName = "LazyCode";
}