import { createBrowserHistory, History, Location } from "history";
import { Action, Type } from "state/actions";

export interface IHistoryState {
    history: History,
    location: Location,
}

export function historyReducer(state: IHistoryState, action: Action) {
    if(action.type == Type.HISTORY_UPDATE) {
        return { ...state, location: state.history.location };
    }

    return state || null;
}