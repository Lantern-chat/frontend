import React from "react";
import ReactDOM from "react-dom";

interface ModalProps {
    children: React.ReactNode,
}

interface IModal {
    e: HTMLDivElement,

    /// In use
    u: boolean,
}

const MODALS: IModal[] = [];

export class Modal extends React.Component<ModalProps> {
    m: IModal;

    constructor(props: ModalProps) {
        super(props);

        let available_modal = MODALS.find((m) => !m.u);

        if(!available_modal) {
            available_modal = { e: document.createElement('div'), u: false };
            available_modal.e.className = "ln-modal";
            available_modal.e.style.zIndex = (MODALS.length + 500).toString();
            document.body.appendChild(available_modal.e);

            MODALS.push(available_modal);
        }

        this.m = available_modal;
    }

    componentDidMount() {
        this.m.u = true;
    }

    componentWillUnmount() {
        this.m.u = false;
    }

    render() {
        return ReactDOM.createPortal(this.props.children, this.m.e);
    }
}