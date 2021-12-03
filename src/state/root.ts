import { IChatState, IWindowState, IModalState, IGatewayState, IUserState, IPartyState, IPrefsState, IHistoryState, ICacheState, IToastState } from "./reducers";

import { promiseMiddleware } from "./middleware/promise";
import { applyMiddleware } from "redux";
import thunk from 'redux-thunk';
import { createLogger } from "redux-logger";
import { createDynamicMiddlewares } from "./middleware";
import { composeWithDevTools } from 'redux-devtools-extension';

export { Action, Type, DispatchableAction } from "./actions";

export interface RootState {
    chat: IChatState,
    cache: ICacheState,
    window: IWindowState,
    modals: IModalState,
    gateway: IGatewayState,
    user: IUserState,
    party: IPartyState,
    history: IHistoryState,
    prefs: IPrefsState,
    toasts: IToastState
}

export const DYNAMIC_MIDDLEWARE = createDynamicMiddlewares();

export const enhancers = __DEV__ ?
    composeWithDevTools(applyMiddleware(thunk, DYNAMIC_MIDDLEWARE.enhancers, promiseMiddleware, createLogger({ level: 'debug' }))) :
    applyMiddleware(thunk, DYNAMIC_MIDDLEWARE.enhancers, promiseMiddleware);


import { DefaultMemoizeOptions } from "reselect";

export function createMemoizeOptions(maxSize: number = 1): DefaultMemoizeOptions {
    return {
        maxSize,
    }
}