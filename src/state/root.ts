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

import type { Action } from "./actions";

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

import { Dispatch, Store, TypedUseSelectorHook, useDispatch, useSelector, useStore } from "solid-mutant";
export const useRootSelector: TypedUseSelectorHook<RootState> = useSelector as any;
export const useRootStore: () => Store<RootState, Action> = useStore;
export const useRootDispatch: () => Dispatch<Action, RootState> = useDispatch;