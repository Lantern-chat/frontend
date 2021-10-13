import { hasUserPrefFlag, UserPreferenceFlags } from "state/models";
import { RootState } from "state/root";

export function selectPrefsFlag(flag: UserPreferenceFlags): (state: RootState) => boolean {
    return (state: RootState) => hasUserPrefFlag(state.prefs, flag);
}