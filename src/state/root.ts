import { IChatState, IWindowState, IModalState, IGatewayState, IUserState, IPartyState, IThemeState, IHistoryState } from "./reducers";

import { promiseMiddleware } from "./middleware/promise";
import { applyMiddleware } from "redux";
import { createLogger } from "redux-logger";

export interface RootState {
    chat: IChatState,
    window: IWindowState,
    modals: IModalState,
    gateway: IGatewayState,
    user: IUserState,
    party: IPartyState,
    history: IHistoryState,
    theme: IThemeState,
}

export const enhancers = process.env.NODE_ENV !== 'production' ?
    applyMiddleware(promiseMiddleware, createLogger()) :
    applyMiddleware(promiseMiddleware);