import { JSX, onCleanup, splitProps } from "solid-js";
import { insert } from "solid-js/web";
import { createRootBlur } from "ui/hooks/createRootBlur";

const MODAL_ROOT = document.getElementById("ln-modal-root")!;

interface ModalProps {
    children?: JSX.Element,
}

import "./modal.scss";
export function Modal(props: ModalProps) {
    const container = document.createElement('div');
    insert(container, () => props.children);
    MODAL_ROOT.appendChild(container);
    onCleanup(() => MODAL_ROOT.removeChild(container));
    return false;
}

export function FullscreenModal(props: JSX.HTMLAttributes<HTMLDivElement> & { blur?: boolean }) {
    let [local, rest] = splitProps(props, ['class']);

    let cn = () => [local.class, "ln-fullscreen-modal"].join(" ");

    createRootBlur(props);

    return (
        <Modal>
            <div {...rest} class={cn()} />
        </Modal>
    );
}