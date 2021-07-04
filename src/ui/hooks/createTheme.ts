
import { useState, useLayoutEffect } from "react";

import * as theme from "lib/theme";
import { IThemeContext } from "lib/theme";
export { Theme } from "lib/theme";

let IS_FIRST_THEME = true;
let existing_theme: string | null | IThemeContext = localStorage.getItem('theme');
if(existing_theme) {
    existing_theme = JSON.parse(existing_theme) as IThemeContext;
}

export function createTheme(): IThemeContext {
    let [theme_context, setThemeContext] = useState<IThemeContext>(existing_theme as IThemeContext || theme.DEFAULT_THEME);
    theme_context.setTheme = (new_theme: theme.IThemeContext) => setThemeContext(new_theme);

    useLayoutEffect(() => {
        if(theme_context.is_light) {
            theme.setTheme(theme.genLightTheme(theme_context.temperature), !IS_FIRST_THEME, true);
        } else {
            theme.setTheme(theme.genDarkTheme(theme_context.temperature), !IS_FIRST_THEME, false);
        }

        IS_FIRST_THEME = false;

        localStorage.setItem('theme', JSON.stringify(theme_context));
    }, [theme_context.is_light, theme_context.temperature]);

    return theme_context;
}

