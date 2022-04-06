import { Accessor, children as resolve_children, JSX, createMemo } from "solid-js";
import { ResolvedChildren } from "solid-js/types/reactive/signal";

export function useChildrenArray(children: Accessor<JSX.Element>): Accessor<Array<ResolvedChildren>> {
    let resolved = resolve_children(children);

    return createMemo(() => {
        let r = resolved();
        return Array.isArray(r) ? r : [r];
    });
}