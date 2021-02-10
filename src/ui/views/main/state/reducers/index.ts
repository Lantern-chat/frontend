import { combineReducers } from "redux";

import { messageReducer } from "./messages";
import { modalReducer } from "./modals";
import { windowReducer } from "./window";

export const rootReducer = combineReducers({
    messages: messageReducer,
    window: windowReducer,
    modals: modalReducer,
});

export type RootState = ReturnType<typeof rootReducer>;