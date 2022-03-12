import { Action, Type } from "../actions";

import { IToast } from "ui/components/toast";
import { mutatorWithDefault } from "solid-mutant";

export interface IToastState {
    toasts: IToast[],
}

var TOAST_ID = 0;

export const toastMutator = mutatorWithDefault(
    () => ({
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
    }),
    (state: IToastState, action: Action) => {
        switch(action.type) {
            case Type.OPEN_TOAST: {
                state.toasts.push({ ...action.toast, id: TOAST_ID++ });
                break;
            }
            case Type.CLEAR_TOAST: {
                let idx = state.toasts.findIndex(toast => toast.id == action.id);
                if(idx < 0) break;
                state.toasts.splice(idx, 1); // remove toast at index
                break;
            }
        }
    }
);