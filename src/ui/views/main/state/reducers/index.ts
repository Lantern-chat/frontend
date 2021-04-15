import { combineReducers } from "redux";

import { messageReducer } from "./messages";
import { modalReducer } from "./modals";
import { windowReducer } from "./window";
import { gatewayReducer } from "./gateway";

export const rootReducer = combineReducers({
    messages: messageReducer,
    window: windowReducer,
    modals: modalReducer,
    gateway: gatewayReducer,
});

export type RootState = ReturnType<typeof rootReducer>;