import { combineReducers } from "redux";

import { messageReducer } from "./messages";

export const rootReducer = combineReducers({
    messages: messageReducer,
});

export type RootState = ReturnType<typeof rootReducer>;