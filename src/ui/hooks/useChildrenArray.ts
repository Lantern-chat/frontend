import { Accessor, children as resolveChildren, JSX, createMemo } from "solid-js";
import type { ResolvedChildren } from "solid-js/types/reactive/signal";

export function useChildrenArray(children: Accessor<JSX.Element>): Accessor<Array<ResolvedChildren>> {
    let resolved = resolveChildren(children);

    return createMemo(() => {
        let r = resolved();
        return Array.isArray(r) ? r : [r];
    });
}