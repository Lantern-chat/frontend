import { combineReducers } from "redux";

import { windowReducer } from "./reducers/window";
import { userReducer } from "./reducers/user";
import { themeReducer } from "./reducers/theme";
import { historyReducer } from "./reducers/history";

import { Action } from "./actions";
export { Type } from "./actions";

function dummyReducer(state: any, action: any) {
    return null as any;
}

import { RootState } from "./root";
export { enhancers } from "./root";

export const initialReducer = combineReducers<RootState, Action>({
    chat: dummyReducer,
    cache: dummyReducer,
    window: windowReducer,
    modals: dummyReducer,
    gateway: dummyReducer,
    user: userReducer,
    party: dummyReducer,
    theme: themeReducer,
    history: historyReducer,
});

