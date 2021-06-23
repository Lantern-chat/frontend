import { createContext } from "react";

import { change_color, darken, lighten, lightness, RGBColor, desaturate, formatRGB, adjust_color, kelvin2 } from "./color";

const { min, max, round } = Math;

export interface ITheme {
    primary_surface_color: RGBColor,
    secondary_surface_color: RGBColor,
    tertiary_surface_color: RGBColor,
    primary_text_color: RGBColor,
    secondary_text_color: RGBColor,
}

export const MIN_TEMP: number = 965.0;
export const MAX_TEMP: number = 12000;

let clamp_temp = (temp: number): number => min(MAX_TEMP, max(MIN_TEMP, temp));

export var LIGHT_THEME: boolean = false;

export interface IThemeContext {
    is_light: boolean,
    temperature: number,
    setTheme: (theme: IThemeContext) => void,
}

export const DEFAULT_THEME: IThemeContext = {
    is_light: false,
    temperature: 7500,
    setTheme: (_theme: IThemeContext) => { }
};

export const Theme = createContext<IThemeContext>(DEFAULT_THEME);
if(__DEV__) {
    Theme.displayName = "ThemeContext";
}

export function genDarkTheme(temperature: number): ITheme {
    LIGHT_THEME = false;

    temperature = clamp_temp(temperature);
    let k = kelvin2(temperature);

    let s = (temperature - 7000) / 20000;
    s *= s;
    s += 0.05;

    //console.log("saturation: ", s);

    let primary_surface_color = change_color(k, { l: 0.2, s: s });
    let secondary_surface_color = darken(primary_surface_color, 0.05);
    let tertiary_surface_color = lighten(primary_surface_color, 0.05);

    let primary_text_color = change_color(primary_surface_color, {
        s: 0,
        l: 1.1 - lightness(primary_surface_color),
    });
    let secondary_text_color = darken(primary_text_color, 0.2);

    return {
        primary_surface_color,
        secondary_surface_color,
        tertiary_surface_color,
        primary_text_color,
        secondary_text_color
    };
}

export function genLightTheme(temperature: number): ITheme {
    LIGHT_THEME = true;

    temperature = clamp_temp(temperature);
    let k = kelvin2(temperature);

    let s = (temperature - 7000) / 19000;
    s *= s;
    s += 0.7;

    let l = (temperature - 6500) / (MAX_TEMP - MIN_TEMP);
    l *= -l;
    l += 0.99;

    //console.log("saturation: ", s);
    //console.log("lightness: ", l);

    let primary_surface_color = change_color(k, { s: s, l: l });
    let secondary_surface_color = adjust_color(primary_surface_color, { l: -0.05, s: -0.4 });
    let primary_text_color = change_color(primary_surface_color, {
        s: 0,
        l: 1.0 - lightness(primary_surface_color),
    });
    let secondary_text_color = lighten(primary_text_color, 0.3);

    return {
        primary_surface_color,
        secondary_surface_color,
        tertiary_surface_color: { r: 1, g: 1, b: 1 },
        primary_text_color,
        secondary_text_color,
    }
}

var currentTimer: ReturnType<typeof setTimeout> | null = null;

export function setTheme(theme: ITheme, animate: boolean, is_light: boolean) {
    let de = document.documentElement;

    if(animate) {
        de.classList.add("ln-theme-transition");
    }

    if(is_light) {
        de.classList.remove('ln-dark-theme');
        de.classList.add('ln-light-theme');
    } else {
        de.classList.add('ln-dark-theme');
        de.classList.remove('ln-light-theme');
    }

    for(let key in theme) {
        let varname = "--ln-" + key.replace(/_/g, '-');
        let value = formatRGB(theme[key]);

        //console.log("Setting %s to %s", varname, value);
        de.style.setProperty(varname, value);
    }

    if(animate) {
        if(currentTimer !== null) {
            clearTimeout(currentTimer);
        }

        currentTimer = setTimeout(() => {
            de.classList.remove("ln-theme-transition");
        }, 1000);
    }
}