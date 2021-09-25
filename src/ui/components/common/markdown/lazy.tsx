import React from "react";
import { ICodeProps } from "./components/code";
import { IMathProps } from "./components/math";

const LazyMath = React.lazy(() => import("./components/math"));
const LazyCode = React.lazy(() => import("./components/code"));

const MathFallback = React.memo((props: IMathProps) => {
    return <pre>{props.src}</pre>
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