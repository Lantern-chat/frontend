import { createMemo, JSX } from "solid-js";
import { Portal } from "solid-js/web";

const MODAL_ROOT = document.getElementById("ln-modal-root")!;

interface ModalProps {
    children?: JSX.Element,
}

export function Modal(props: ModalProps) {
    return <Portal mount={MODAL_ROOT} children={props.children} />;
}

export function FullscreenModal(props: JSX.HTMLAttributes<HTMLDivElement>) {
    let className = createMemo(() => [props.className, "ln-fullscreen-modal"].join(" "));

    return (
        <Modal>
            <div {...props} className={className()} />
        </Modal>
    );
}