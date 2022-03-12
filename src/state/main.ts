import { combineMutators, Mutator } from "solid-mutant";

import { chatMutator } from "./mutators/chat";
//import { cacheMutator } from "./mutators/cache";
import { modalMutator } from "./mutators/modals";
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

function dummyMutator(): any { }

export const mainMutator = combineMutators<RootState, Action>({
    chat: chatMutator,
    cache: dummyMutator,
    window: windowMutator,
    modals: modalMutator,
    gateway: gatewayMutator,
    user: userMutator,
    party: partyMutator,
    prefs: prefsMutator,
    // history mutator is initialized with a value when creating the store
    history: historyMutator as Mutator<IHistoryState, Action>,
    toasts: toastMutator,
});