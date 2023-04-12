import { Accessor, onCleanup, createSignal } from "solid-js";

import ResizeObserver from "resize-observer-polyfill";

export function createResizeObserver(ref: HTMLElement): Accessor<DOMRectReadOnly> {
    let [rect, setRect] = createSignal<DOMRectReadOnly>({
        x: 0, y: 0, width: 0, height: 0,
        top: 0, right: 0, bottom: 0, left: 0,
    } as DOMRectReadOnly);

    let observer = new ResizeObserver(entries => {
        for(let e of entries) {
            if(e.target == ref) {
                setRect(e.contentRect);
                break;
            }
        }
    });

    observer.observe(ref);

    onCleanup(() => observer.disconnect());

    return rect;
}