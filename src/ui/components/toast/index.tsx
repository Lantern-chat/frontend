import { createEffect, createMemo, createSignal, For, onCleanup, Show } from "solid-js";
import { createStructuredSelector, useDispatch } from "solid-mutant";
import { UserPreferenceFlags } from "state/models";
import { RootState, Type, useRootSelector } from "state/root";
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

const toast_selector = createStructuredSelector<RootState>()({
    toasts: state => state.toasts.toasts,
    reduced_motion: selectPrefsFlag(UserPreferenceFlags.ReduceAnimations),
});

import "./toast.scss";

export function Toasts() {
    let state = useRootSelector(toast_selector)();

    return (
        <Show when={state.toasts.length}>
            <Modal>
                <div className="ln-toast-container top right">
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
        dispatch = useDispatch();

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

    let className = createMemo(() => {
        let cls = `ln-toast ${props.level}`;

        if(cleared()) {
            cls += ' cleared';
        }

        return cls;
    });

    return (
        <li className={className()} onClick={clearToast}>
            {props.title && <h3 textContent={props.title} />}
            <span>{props.text}</span>
        </li>
    );
}