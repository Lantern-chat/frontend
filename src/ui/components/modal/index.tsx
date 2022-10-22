import { JSX, onCleanup, splitProps } from "solid-js";
import { spread } from "solid-js/web";
import { createRootBlur } from "ui/hooks/createRootBlur";

const MODAL_ROOT = document.getElementById("ln-modal-root")!;

import "./modal.scss";
export function Modal(props: JSX.HTMLAttributes<HTMLDivElement>) {
    const container = document.createElement('div');
    spread(container, props);
    MODAL_ROOT.appendChild(container);
    onCleanup(() => MODAL_ROOT.removeChild(container));
    return false;
}

export function FullscreenModal(props: JSX.HTMLAttributes<HTMLDivElement> & { blur?: boolean }) {
    let [local, rest] = splitProps(props, ['class']);

    let cn = () => [local.class, "ln-fullscreen-modal"].join(" ");

    createRootBlur(props);

    return (<Modal {...rest} class={cn()} />);
}