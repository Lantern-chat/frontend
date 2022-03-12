import type {
    IChatState,
    IWindowState,
    IModalState,
    IGatewayState,
    IUserState,
    IPartyState,
    IPrefsState,
    IHistoryState,
    ICacheState,
    IToastState,
} from "./mutators";

export { Type } from "./actions";
export type { Action } from "./actions";

export interface RootState {
    chat: IChatState,
    cache: ICacheState,
    window: IWindowState,
    modals: IModalState,
    gateway: IGatewayState,
    user: IUserState,
    party: IPartyState,
    history: IHistoryState,
    prefs: IPrefsState,
    toasts: IToastState
}

import { TypedUseSelectorHook, useSelector } from "solid-mutant";
export const useRootSelector: TypedUseSelectorHook<RootState> = useSelector as any;