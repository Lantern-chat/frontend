import { Accessor, onCleanup } from "solid-js";

// https://bugs.chromium.org/p/chromium/issues/detail?id=1177010 and similar
export function cleanedEvent(el: HTMLElement, events: Accessor<Array<[event: string, listener: (e: Event) => void]>>) {
    let evs = events();

    for(let [event, listener] of evs) {
        el.addEventListener(event, listener);
    }

    if('chrome' in window) {
        onCleanup(() => {
            console.log("Cleaning up chrome events...");
            for(let [event, listener] of evs) {
                el.removeEventListener(event, listener);
            }
        });
    }
}