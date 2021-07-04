import { DispatchableAction, Type } from "state/actions";
import { genDarkTheme, genLightTheme, setTheme as setRealTheme } from "lib/theme";

var dispatch_timeout: ReturnType<typeof setTimeout>;

export function setTheme(temperature: number, is_light: boolean): DispatchableAction {
    return (dispatch) => {
        let theme = { temperature, is_light };
        setRealTheme(theme, true);

        // effectively debounces the theme setting in redux, avoiding costly subscription updates
        clearTimeout(dispatch_timeout);
        dispatch_timeout = setTimeout(() => {
            localStorage.setItem('theme', JSON.stringify(theme));

            dispatch({ type: Type.SET_THEME, temperature, is_light });
        }, 500);
    };
}