import { JSX, onCleanup, splitProps } from "solid-js";
import { spread } from "solid-js/web";

const MODAL_ROOT = document.getElementById("ln-modal-root")!;

import "./modal.scss";
export function Modal(props: JSX.HTMLAttributes<HTMLDivElement>): JSX.Element {
    const container = document.createElement("div");
    spread(container, props);
    MODAL_ROOT.appendChild(container);
    onCleanup(() => MODAL_ROOT.removeChild(container));
    return false;
}

export function FullscreenModal(props: JSX.HTMLAttributes<HTMLDivElement> & { blur?: boolean }) {
    let [local, rest] = splitProps(props, ["class", "blur", "classList"]);

    return (<Modal {...rest}
        class={[local.class, "ln-fullscreen-modal"].join(" ")}
        classList={{ "ln-backdrop-blur": local.blur, ...local.classList }} />);
}