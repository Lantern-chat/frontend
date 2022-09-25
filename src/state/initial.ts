import type { Mutator } from "solid-mutant";

import { windowMutator } from "./mutators/window";
import { userMutator } from "./mutators/user";
import { prefsMutator } from "./mutators/prefs";
import { historyMutator, IHistoryState } from "./mutators/history";
import { toastMutator } from "./mutators/toasts";

import type { RootState } from "./root";
import type { Action } from "./actions";
export { Type } from "./actions";

export const initialMutator: Mutator<RootState, Action> = (state: RootState, action: Action) => {
    // chat
    // cache
    windowMutator(state, action); // window
    // gateway
    userMutator(state, action); // user
    // party
    prefsMutator(state, action);// prefs
    historyMutator(state, action); // history
    toastMutator(state, action); // toasts
}