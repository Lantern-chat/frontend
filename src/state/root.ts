import type {
    IChatState,
    IWindowState,
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
    gateway: IGatewayState,
    user: IUserState,
    party: IPartyState,
    history: IHistoryState,
    prefs: IPrefsState,
    toasts: IToastState
}

export type ReadRootState = DeepReadonly<RootState>;

import { TypedUseSelectorHook, useSelector } from "solid-mutant";
export const useRootSelector: TypedUseSelectorHook<RootState> = useSelector as any;