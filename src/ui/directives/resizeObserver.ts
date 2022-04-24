import { Accessor, onCleanup } from "solid-js";

import ResizeObserver from "resize-observer-polyfill";

export function resizeObserver(el: HTMLElement, cb: Accessor<(rect: DOMRectReadOnly) => void>) {
    let observer = new ResizeObserver(entries => {
        for(let e of entries) {
            if(e.target == el) {
                cb()(e.contentRect);
                break;
            }
        }
    });

    observer.observe(el);

    onCleanup(() => observer.disconnect());
}