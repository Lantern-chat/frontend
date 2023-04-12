import { createEffect, createMemo, createSignal, For, onCleanup, Show } from "solid-js";
import { usePrefs } from "state/contexts/prefs";
import { Type, useRootDispatch, useRootSelector } from "state/root";

import { Modal } from "../modal";

export const enum ToastIcon {

}

export const enum ToastLevel {
    Info = "info",
    Success = "success",
    Warning = "warning",
    Error = "error",
}

export interface IToast {
    id: number,
    title?: string,
    icon?: ToastIcon,
    text: string,
    level: ToastLevel,
    timeout?: number,
}

export interface IToastProps extends IToast {
    reduced_motion: boolean,
}

import "./toast.scss";

export function Toasts() {
    let prefs = usePrefs();

    let toasts = useRootSelector(state => state.toasts.toasts);

    return (
        <Show when={toasts().length}>
            <Modal>
                <div class="ln-toast-container top right">
                    <ul>
                        <For each={toasts()}>
                            {toast => <Toast {...toast} reduced_motion={prefs.ReduceAnimations()} />}
                        </For>
                    </ul>
                </div>
            </Modal>
        </Show>
    );
}

function Toast(props: IToastProps) {
    let [cleared, setCleared] = createSignal(false),
        dispatch = useRootDispatch();

    let clearToast = () => {
        let cb = () => dispatch({ type: Type.CLEAR_TOAST, id: props.id });

        if(props.reduced_motion) {
            cb();
        } else {
            setCleared(true);
            setTimeout(cb, 300);
        }
    };

    createEffect(() => {
        if(props.timeout) {
            let handle = setTimeout(() => clearToast(), props.timeout);
            onCleanup(() => clearTimeout(handle));
        }
    });

    return (
        <li class="ln-toast" onClick={clearToast}
            classList={{ "cleared": cleared(), [props.level]: true }}
        >
            <Show when={props.title}>
                {title => <h3 textContent={title()} />}
            </Show>
            <span>{props.text}</span>
        </li>
    );
}