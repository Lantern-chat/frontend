import { enableMapSet } from "immer";

enableMapSet();

import { applyMiddleware, combineReducers } from "redux";
import { createLogger } from "redux-logger";

import { chatReducer, IChatState } from "./reducers/chat";
import { modalReducer, IModalState } from "./reducers/modals";
import { windowReducer, IWindowState } from "./reducers/window";
import { gatewayReducer, IGatewayState } from "./reducers/gateway";
import { userReducer, IUserState } from "./reducers/user";
import { partyReducer, IPartyState } from "./reducers/party";

import { promiseMiddleware } from "./middleware/promise";

import { Action } from "./actions";
export { Type } from "./actions";

export interface RootState {
    chat: IChatState,
    window: IWindowState,
    modals: IModalState,
    gateway: IGatewayState,
    user: IUserState,
    party: IPartyState,
}

export const rootReducer = combineReducers<RootState, Action>({
    chat: chatReducer,
    window: windowReducer,
    modals: modalReducer,
    gateway: gatewayReducer,
    user: userReducer,
    party: partyReducer,
});

export const enhancers = applyMiddleware(promiseMiddleware, createLogger());