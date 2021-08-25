import { enableMapSet } from "immer";

enableMapSet();

import { combineReducers } from "redux";

import { chatReducer } from "./reducers/chat";
import { cacheReducer } from "./reducers/cache";
import { modalReducer } from "./reducers/modals";
import { windowReducer } from "./reducers/window";
import { gatewayReducer } from "./reducers/gateway";
import { userReducer } from "./reducers/user";
import { partyReducer } from "./reducers/party";
import { themeReducer } from "./reducers/theme";
import { historyReducer } from "./reducers/history";

import { Action } from "./actions";
export { Type } from "./actions";

import { RootState } from "./root";
export { enhancers } from "./root";

export const mainReducer = combineReducers<RootState, Action>({
    chat: chatReducer,
    cache: cacheReducer,
    window: windowReducer,
    modals: modalReducer,
    gateway: gatewayReducer,
    user: userReducer,
    party: partyReducer,
    theme: themeReducer,
    history: historyReducer
});