import type { Mutator } from "solid-mutant";

import { chatMutator } from "./mutators/chat";
import { cacheMutator } from "./mutators/cache";
import { windowMutator } from "./mutators/window";
import { gatewayMutator } from "./mutators/gateway";
import { userMutator } from "./mutators/user";
import { partyMutator } from "./mutators/party";
import { prefsMutator } from "./mutators/prefs";
import { historyMutator, IHistoryState } from "./mutators/history";
import { toastMutator } from "./mutators/toasts";

import type { Action } from "./actions";
export { Type } from "./actions";

import type { RootState } from "./root";

export const mainMutator: Mutator<RootState, Action> = (state: RootState, action: Action) => {
    chatMutator(state, action);
    cacheMutator(state, action);
    windowMutator(state, action);
    gatewayMutator(state, action);
    userMutator(state, action);
    partyMutator(state, action);
    prefsMutator(state, action);
    historyMutator(state, action);
    toastMutator(state, action);
};