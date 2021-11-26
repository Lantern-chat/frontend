import { ITheme } from "lib/theme";
import { createStructuredSelector } from "reselect";
import { hasUserPrefFlag, UserPreferenceFlags } from "state/models";
import { RootState } from "state/root";

export const themeSelector = createStructuredSelector<RootState, ITheme>({
    temperature: (state: RootState) => state.prefs.temp,
    is_light: (state: RootState) => hasUserPrefFlag(state.prefs, UserPreferenceFlags.LightMode),
    oled: (state: RootState) => hasUserPrefFlag(state.prefs, UserPreferenceFlags.OledMode),
});