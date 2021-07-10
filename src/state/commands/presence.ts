import { DispatchableAction } from "state/actions";

export function setPresence(away: boolean): DispatchableAction {
    return (dispatch, getState) => {
        let state = getState(), presence = state.user.presence;

        // if no change, return early.
        if((!away && presence == 'online') || (away && presence == 'away')) return;
    };
}