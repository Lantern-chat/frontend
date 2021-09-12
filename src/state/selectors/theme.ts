import { ITheme } from "lib/theme";
import { RootState } from "state/root";

export function themeSelector(state: RootState): ITheme {
    return {
        temperature: state.prefs.temp,
        is_light: state.prefs.light,
    }
}