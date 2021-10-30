import { hasUserPrefFlag, UserPreferenceFlags } from "state/models";
import { getPad } from "state/reducers/prefs";
import { RootState } from "state/root";

export function selectPrefsFlag(flag: UserPreferenceFlags): (state: RootState) => boolean {
    return (state: RootState) => hasUserPrefFlag(state.prefs, flag);
}

export function selectGroupPad(state: RootState): number {
    return getPad(state.prefs);
}