import React from "react";
import { ICodeProps } from "./code";
import { IMathProps } from "./math";

const LazyMath = React.lazy(() => import("./math"));
const LazyCode = React.lazy(() => import("./code"));

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