import { combineReducers } from "redux";

import { messageReducer } from "./messages";
import { windowReducer } from "./window";

export const rootReducer = combineReducers({
    messages: messageReducer,
    window: windowReducer,
});

export type RootState = ReturnType<typeof rootReducer>;