import { JSX, splitProps } from "solid-js";
import { Portal } from "solid-js/web";
import { createRootBlur } from "ui/hooks/createRootBlur";

const MODAL_ROOT = document.getElementById("ln-modal-root")!;

interface ModalProps {
    children?: JSX.Element,
}

import "./modal.scss";

export function Modal(props: ModalProps) {
    return <Portal mount={MODAL_ROOT} children={props.children} />;
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