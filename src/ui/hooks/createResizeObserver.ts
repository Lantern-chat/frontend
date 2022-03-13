import { Accessor, onMount, onCleanup, createEffect, createSignal } from "solid-js";
import { Ref, Refable } from "ui/hooks/useRef";

import ResizeObserver from "resize-observer-polyfill";

export function createResizeObserver<H extends Refable>(ref: Ref<H>): Accessor<DOMRectReadOnly> {
    let [rect, setRect] = createSignal<DOMRectReadOnly>({
        x: 0, y: 0, width: 0, height: 0,
        top: 0, right: 0, bottom: 0, left: 0,
    } as DOMRectReadOnly);

    onMount(() => {
        let observer = new ResizeObserver(entries => {
            for(let e of entries) {
                if(e.target == ref.current) {
                    setRect(e.contentRect);
                    break;
                }
            }
        });

        createEffect(() => {
            ref.current && observer.observe(ref.current);
        });

        onCleanup(() => observer.disconnect());
    });

    return rect;
}