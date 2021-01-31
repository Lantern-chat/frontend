import { LanternStore } from "models/store";
import { combineReducers } from "redux";

export const rootReducer = combineReducers({ default: (state: LanternStore = {}) => state });