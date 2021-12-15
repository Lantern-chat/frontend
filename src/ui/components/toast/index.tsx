import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { createStructuredSelector } from "reselect";

import { UserPreferenceFlags } from "state/models";
import { RootState, Type } from "state/root";
import { selectPrefsFlag } from "state/selectors/prefs";

import { Modal } from "../modal";

export enum ToastIcon {

}

export enum ToastLevel {
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

const toast_selector = createStructuredSelector({
    toasts: (state: RootState) => state.toasts.toasts,
    reduced_motion: selectPrefsFlag(UserPreferenceFlags.ReduceAnimations),
})

import "./toast.scss";
export const Toasts = React.memo(() => {
    let { toasts, reduced_motion } = useSelector(toast_selector);

    if(toasts.length == 0) {
        return null;
    }

    return (
        <Modal>
            <div className="ln-toast-container top right">
                <ul>
                    {toasts.map((toast, i) => (
                        <Toast {...toast} reduced_motion={reduced_motion} key={toast.id} />
                    ))}
                </ul>
            </div>
        </Modal>
    );
});


const Toast = React.memo((props: IToastProps) => {
    let cls = `ln-toast ${props.level}`;

    let [cleared, setCleared] = useState(false), dispatch = useDispatch();

    if(cleared) {
        cls += ' cleared';
    }

    let clearToast = useCallback(() => {
        let cb = () => dispatch({ type: Type.CLEAR_TOAST, id: props.id });

        if(props.reduced_motion) {
            cb();
        } else {
            setCleared(true);
            setTimeout(cb, 300);
        }
    }, [props]);

    useEffect(() => {
        if(props.timeout) {
            let handle = setTimeout(() => clearToast(), props.timeout);
            return () => clearTimeout(handle);
        }
        return;
    }, [clearToast]);

    return (
        <li className={cls} onClick={clearToast}>
            {props.title && <h3>{props.title}</h3>}

            <span>{props.text}</span>
        </li>
    );
});

if(__DEV__) {
    Toasts.displayName = "Toasts";
    Toast.displayName = "Toast";
}