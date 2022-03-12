import { ITheme } from "lib/theme";
import { createStructuredSelector } from "solid-mutant";
import { hasUserPrefFlag, UserPreferenceFlags } from "state/models";
import { RootState } from "state/root";

export const themeSelector = createStructuredSelector<RootState, ITheme>({
    temperature: state => state.prefs.temp,
    is_light: state => hasUserPrefFlag(state.prefs, UserPreferenceFlags.LightMode),
    oled: state => hasUserPrefFlag(state.prefs, UserPreferenceFlags.OledMode),
});