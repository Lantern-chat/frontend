import { combineMutators, Mutator } from "solid-mutant";

import { windowMutator } from "./mutators/window";
import { userMutator } from "./mutators/user";
import { prefsMutator } from "./mutators/prefs";
import { historyMutator, IHistoryState } from "./mutators/history";
import { toastMutator } from "./mutators/toasts";

import { Action } from "./actions";
export { Type } from "./actions";

function dummyMutator(): any { }

import { RootState } from "./root";

export const initialMutator = combineMutators<RootState, Action>({
    chat: dummyMutator,
    cache: dummyMutator,
    window: windowMutator,
    gateway: dummyMutator,
    user: userMutator,
    party: dummyMutator,
    prefs: prefsMutator,
    // history mutator is initialized with a value when creating the store
    history: historyMutator as Mutator<IHistoryState, Action>,
    toasts: toastMutator,
});