import { Accessor, onCleanup } from "solid-js";

export function eat(el: HTMLElement, events: Accessor<Array<keyof HTMLElementEventMap>>) {
    let evs = events(), listener = (e: Event) => e.stopPropagation();
    evs.forEach(ev => el.addEventListener(ev, listener));
    onCleanup(() => evs.forEach(ev => el.removeEventListener(ev, listener)));
}