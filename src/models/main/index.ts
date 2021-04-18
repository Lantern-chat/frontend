import { combineReducers } from "redux";

import { messageReducer } from "./reducers/messages";
import { modalReducer } from "./reducers/modals";
import { windowReducer } from "./reducers/window";
import { gatewayReducer } from "./reducers/gateway";

export const rootReducer = combineReducers({
    messages: messageReducer,
    window: windowReducer,
    modals: modalReducer,
    gateway: gatewayReducer,
});

export type RootState = ReturnType<typeof rootReducer>;