import { hasUserPrefFlag, UserPreferenceFlags } from "state/models";
import { getPad } from "state/mutators/prefs";
import { RootState } from "state/root";

export function selectPrefsFlag(flag: UserPreferenceFlags): (state: DeepReadonly<RootState>) => boolean {
    return (state: DeepReadonly<RootState>) => hasUserPrefFlag(state.prefs, flag);
}

export function selectGroupPad(state: DeepReadonly<RootState>): number {
    return getPad(state.prefs);
}