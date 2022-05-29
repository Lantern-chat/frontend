import { createEffect, createMemo, createSignal, For, onCleanup, Show } from "solid-js";
import { useStructuredSelector } from "solid-mutant";
import { UserPreferenceFlags } from "state/models";
import { ReadRootState, Type, useRootDispatch, useRootSelector } from "state/root";
import { selectPrefsFlag } from "state/selectors/prefs";

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
    let state = useStructuredSelector({
        toasts: (state: ReadRootState) => state.toasts.toasts,
        reduced_motion: selectPrefsFlag(UserPreferenceFlags.ReduceAnimations),
    });

    return (
        <Show when={state.toasts.length}>
            <Modal>
                <div class="ln-toast-container top right">
                    <ul>
                        <For each={state.toasts}>
                            {toast => <Toast {...toast} reduced_motion={state.reduced_motion} />}
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
            classList={{ 'cleared': cleared(), [props.level]: true }}
        >
            {props.title && <h3 textContent={props.title} />}
            <span>{props.text}</span>
        </li>
    );
}