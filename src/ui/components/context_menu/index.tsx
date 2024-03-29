import { createEffect, createSignal, createUniqueId, JSX, Show } from "solid-js";
import { Modal } from "ui/components/modal";
import { createTrigger } from "ui/hooks/createTrigger";
import { px } from "ui/utils";

export interface IContextMenuProps {
    children: JSX.Element,
    show: boolean,
}

const REFRESH_EVENTS: string[] = ["resize", "scroll"];

import "./context_menu.scss";
export function ContextMenu(props: IContextMenuProps) {
    let anchor_ref: HTMLSpanElement | undefined,
        [track, dirty] = createTrigger(), [modal, setModal] = createSignal<ComputedModal>();

    //createRenderEffect(() => {
    //    if(props.show) {
    //        let listener = () => dirty();
    //        REFRESH_EVENTS.forEach(e => window.addEventListener(e, listener));
    //        onCleanup(() => REFRESH_EVENTS.forEach(e => window.removeEventListener(e, listener)));
    //    }
    //});

    createEffect(() => {
        if(!props.show) {
            setModal();
        } else {
            let rect = anchor_ref!.getBoundingClientRect();

            track();

            let { top, left, bottom } = rect,
                { innerHeight: height, innerWidth: width } = window;

            let on_top = top < (height * 0.5);
            let on_left = left < (width * 0.5);

            let style: any = {
                position: "relative"
            };

            if(on_top) {
                style.top = "0%";
            } else {
                style.bottom = "0%";
            }

            if(on_left) {
                style.left = "100%";
            } else {
                style.right = "100%";
            }

            setModal({ style, bottom, left } as ComputedModal);
        }
    });

    return (
        <>
            <Show when={modal()}>
                {modal => <ContextMenuInner {...modal()} children={props.children} />}
            </Show>

            <span ref={anchor_ref} class="ln-context-anchor" />
        </>
    )
}

interface ComputedModal {
    style: JSX.CSSProperties, bottom: number, left: number
}

function ContextMenuInner(props: ComputedModal & { children: any }) {
    return (
        <Modal>
            <div style={{ position: "absolute", top: px(props.bottom), left: px(props.left) }}>
                <div style={props.style}>{props.children}{createUniqueId()}</div>
            </div>
        </Modal>
    );
}