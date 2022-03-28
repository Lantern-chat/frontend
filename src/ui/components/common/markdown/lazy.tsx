import { lazy, Suspense } from "solid-js";

import type { ICodeProps } from "./components/code";
import type { IMathProps } from "./components/math";

export type { ICodeProps, IMathProps };

const LazyMath = lazy(() => import(/* webpackChunkName: 'MarkdownMath' */"./components/math"));
const LazyCode = lazy(() => import(/* webpackChunkName: 'MarkdownCode' */"./components/code"));

function MathFallback(props: IMathProps) {
    return props.inline ?
        <code textContent={props.src} /> :
        <pre><code textContent={props.src} /></pre>;
}

function CodeFallback(props: ICodeProps) {
    return <pre className="hljs"><code style={{ whiteSpace: 'pre' }} textContent={props.src} /></pre>
}

export const Math = (props: IMathProps) => (
    <Suspense fallback={<MathFallback {...props} />}>
        <LazyMath {...props} />
    </Suspense>
);

export const Code = (props: ICodeProps) => (
    <Suspense fallback={<CodeFallback {...props} />}>
        <LazyCode {...props} />
    </Suspense>
);