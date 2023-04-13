import { Accessor, JSX, createMemo, untrack } from "solid-js";

type RequiredParameter<T> = T extends () => unknown ? never : T;

/**
 * Conditionally render its children or an optional fallback component
 * @description https://www.solidjs.com/docs/latest/api#show
 */
export function ShowBool<
    TRenderFunction extends (item: Accessor<NonNullable<boolean>>) => JSX.Element
>(props: {
    when: true | undefined | null | false;
    keyed?: false;
    fallback?: JSX.Element;
    children: JSX.Element | RequiredParameter<TRenderFunction>;
}): JSX.Element;
export function ShowBool<TRenderFunction extends (item: NonNullable<boolean>) => JSX.Element>(props: {
    when: true | undefined | null | false;
    keyed: true;
    fallback?: JSX.Element;
    children: JSX.Element | RequiredParameter<TRenderFunction>;
}): JSX.Element;
export function ShowBool(props: {
    when: true | undefined | null | false;
    keyed?: boolean;
    fallback?: JSX.Element;
    children: JSX.Element | ((item: NonNullable<boolean> | Accessor<NonNullable<boolean>>) => JSX.Element);
}): JSX.Element {
    const keyed = props.keyed;
    return createMemo(() => {
        const c = props.when;
        if(c) {
            const child = props.children;
            const fn = typeof child === "function" && child.length > 0;
            return fn
                ? untrack(() =>
                    (child as any)(
                        keyed
                            ? (c as boolean)
                            : () => props.when
                    )
                )
                : child;
        }
        return props.fallback;
    }) as unknown as JSX.Element;
}