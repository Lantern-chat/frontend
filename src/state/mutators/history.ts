import { History, Location } from "history";
import { Action, Type } from "state/actions";
import { IHistoryExt } from "state/global";

export interface IHistoryState {
    history: IHistoryExt,
    location: Location,
    parts: string[],
}

export function recomputeHistoryContext(history: IHistoryExt): IHistoryState {
    let location = history.location,
        parts = location.pathname.slice(1).split('/');

    return { history, location, parts };
}

export function historyMutator(state: IHistoryState, action: Action) {
    if(action.type == Type.HISTORY_UPDATE) {
        Object.assign(state, action.ctx);
    }
}