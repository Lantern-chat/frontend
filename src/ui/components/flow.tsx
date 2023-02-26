import { createMemo, JSX, Show, untrack } from "solid-js";

export function ConstShow<T>(props: {
    when: T | undefined | null | false;
    keyed: true;
    fallback?: JSX.Element;
    children: JSX.Element | ((item: NonNullable<T>) => JSX.Element);
}): () => JSX.Element;
export function ConstShow<T>(props: {
    when: T | undefined | null | false;
    keyed?: false;
    fallback?: JSX.Element;
    children: JSX.Element;
}): () => JSX.Element;
export function ConstShow<T>(props: {
    when: T | undefined | null | false;
    keyed?: boolean;
    fallback?: JSX.Element;
    children: JSX.Element | ((item: NonNullable<T>) => JSX.Element);
}) {
    return createMemo(() => {
        const c = props.when;
        if(c) {
            const child = props.children;
            const fn = typeof child === "function" && child.length > 0;
            return fn ? untrack(() => (child as any)(c as T)) : child;
        }
        return props.fallback;
    }) as () => JSX.Element;
}

