import { hasUserPrefFlag, UserPreferenceFlags } from "state/models";
import { getPad } from "state/mutators/prefs";
import { ReadRootState } from "state/root";

export function selectPrefsFlag(flag: UserPreferenceFlags): (state: ReadRootState) => boolean {
    return (state: ReadRootState) => hasUserPrefFlag(state.prefs, flag);
}

export function selectGroupPad(state: ReadRootState): number {
    return getPad(state.prefs);
}