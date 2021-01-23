import Preact from "preact/compat";

import "./modal.scss";

interface ModalProps {
    children: preact.VNode,
}

const MODAL_ROOT = document.getElementById("ln-modal-root")!;

export class Modal extends Preact.Component<ModalProps> {
    e: HTMLDivElement;

    constructor(props: ModalProps) {
        super(props);
        this.e = document.createElement('div');
    }

    componentDidMount() {
        MODAL_ROOT.appendChild(this.e);
    }

    componentWillUnmount() {
        MODAL_ROOT.removeChild(this.e);
    }

    render() {
        return Preact.createPortal(this.props.children, this.e);
    }
}