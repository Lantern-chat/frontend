import { Action, Type } from "../actions";

import { IToast } from "ui/components/toast";

export interface IToastState {
    toasts: IToast[],
}

var TOAST_ID = 0;

const DEFAULT_STATE: IToastState = {
    toasts: [
        //{
        //    id: TOAST_ID++,
        //    title: "Test",
        //    text: "Test notification",
        //    level: "success" as any,
        //    timeout: 5000,
        //},
        //{
        //    id: TOAST_ID++,
        //    title: "Test",
        //    text: "Test notification Test notification Test notification Test notification",
        //    level: "error" as any,
        //}
    ],
};

export function toastReducer(state: IToastState | null | undefined, action: Action) {
    state = state || DEFAULT_STATE;

    switch(action.type) {
        case Type.OPEN_TOAST: {
            return {
                toasts: [...state.toasts, {
                    ...action.toast,
                    id: TOAST_ID++
                }],
            };
        }
        case Type.CLEAR_TOAST: {
            let idx = state.toasts.findIndex(toast => toast.id == action.id);
            if(idx < 0) break;

            let toasts = state.toasts.slice();
            toasts.splice(idx, 1);

            return { toasts };
        }
    }

    return state;
}