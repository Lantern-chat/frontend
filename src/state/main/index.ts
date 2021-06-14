import { combineReducers } from "redux";

import { messageReducer, IMessageState } from "./reducers/messages";
import { modalReducer, IModalState } from "./reducers/modals";
import { windowReducer, IWindowState } from "./reducers/window";
import { gatewayReducer, IGatewayState } from "./reducers/gateway";

import { Action } from "./actions";
export { Type } from "./actions";

export interface RootState {
    messages: IMessageState,
    window: IWindowState,
    modals: IModalState,
    gateway: IGatewayState,
}

export const rootReducer = combineReducers<RootState, Action>({
    messages: messageReducer,
    window: windowReducer,
    modals: modalReducer,
    gateway: gatewayReducer,
});