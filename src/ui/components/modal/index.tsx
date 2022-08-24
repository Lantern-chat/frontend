import { createMemo, JSX, splitProps } from "solid-js";
import { Portal } from "solid-js/web";

const MODAL_ROOT = document.getElementById("ln-modal-root")!;

interface ModalProps {
    children?: JSX.Element,
}

import "./modal.scss";

export function Modal(props: ModalProps) {
    return <Portal mount={MODAL_ROOT} children={props.children} />;
}

export function FullscreenModal(props: JSX.HTMLAttributes<HTMLDivElement>) {
    let [local, rest] = splitProps(props, ['class']);

    let cn = () => [local.class, "ln-fullscreen-modal"].join(" ");

    return (
        <Modal>
            <div {...rest} class={cn()} />
        </Modal>
    );
}