import { History, Location } from "history";
import { Action, Type } from "state/actions";

export interface IHistoryState {
    history: History,
    location: Location,
    parts: string[],
}

export function recomputeHistoryContext(history: History): IHistoryState {
    let location = history.location,
        parts = location.pathname.slice(1).split('/');

    return { history, location, parts };
}


export function historyReducer(state: IHistoryState, action: Action) {
    if(action.type == Type.HISTORY_UPDATE) {
        return recomputeHistoryContext(state.history);
    }

    return state || null;
}