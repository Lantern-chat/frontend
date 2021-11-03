import React from "react";
import { createPortal } from "react-dom";

import "./modal.scss";

interface ModalProps {
    children: React.ReactNode,
}

const MODAL_ROOT = document.getElementById("ln-modal-root")!;

export class Modal extends React.Component<ModalProps> {
    e: HTMLDivElement;

    constructor(props: ModalProps) {
        super(props);
        this.e = document.createElement('div');
    }

    componentDidMount() { MODAL_ROOT.appendChild(this.e); }
    componentWillUnmount() { MODAL_ROOT.removeChild(this.e); }

    render() {
        return createPortal(this.props.children, this.e);
    }
}

export interface IFullscreenModalProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> { }

export const FullscreenModal = React.memo((props: IFullscreenModalProps) => {
    let className = props.className;
    className = (className ? className + " " : "") + "ln-fullscreen-modal";

    return (<Modal><div {...props} className={className} /></Modal>)
});