import { change_color, darken, lighten, lightness, RGBColor, desaturate, formatRGB, adjust_color, kelvin2, rgb, rgb2hsl, hue, saturation, hsl2rgb, formatRGBHex } from "./color";

const { min, max, round } = Math;

export interface IThemeColors {
    primary_surface_color: RGBColor,
    secondary_surface_color: RGBColor,
    tertiary_surface_color: RGBColor,
    primary_text_color: RGBColor,
    secondary_text_color: RGBColor,
}

export interface ITheme {
    temperature: number,
    is_light: boolean,
    oled: boolean,
}

export const MIN_TEMP: number = 965.0;
export const MAX_TEMP: number = 12000;

let clamp_temp = (temp: number): number => min(MAX_TEMP, max(MIN_TEMP, temp));

export var LIGHT_THEME: boolean = false;

export function genDarkTheme(temperature: number, oled: boolean): IThemeColors {
    temperature = clamp_temp(temperature);
    let k = kelvin2(temperature);

    // compute saturation
    let s = (temperature - 7000) / 20000;
    s *= s;
    s += 0.05;

    let l = 0.2;

    if(oled) {
        s *= 0.5;
        l = 5.0 / 256.0;
    }

    //console.log("saturation: ", s);

    let primary_surface_color = change_color(k, { l, s });
    let secondary_surface_color = oled ? primary_surface_color : darken(primary_surface_color, 0.05);
    let tertiary_surface_color = oled ? primary_surface_color : lighten(primary_surface_color, 0.05);

    let primary_text_color = change_color(primary_surface_color, {
        s: 0,
        l: oled ? 0.8 : (1.1 - lightness(primary_surface_color)),
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

/*
For light/dark modes:

Secondary is darkest
Primary is medium
Tertiary is lightest
*/

export function genLightTheme(temperature: number): IThemeColors {
    temperature = clamp_temp(temperature);
    let k = kelvin2(temperature);

    let s = (temperature - 7000) / 19000;
    s *= s;
    s += 0.7;

    let l = (temperature - 6500) / (MAX_TEMP - MIN_TEMP);
    l *= -l;
    l += 0.99;

    let primary_surface_color = change_color(k, { s, l });
    let secondary_surface_color = adjust_color(primary_surface_color, { l: -0.1 });

    let s2 = Math.abs(temperature - 7000) / 2000;
    s2 *= s2 * s2; // ^3
    s2 = Math.min(0, Math.max(-1, s2 - 0.5));
    let s3 = s2 + s;

    secondary_surface_color = change_color(secondary_surface_color, { s: s3 });
    let tertiary_surface_color = lighten(primary_surface_color, Math.max(0, 0.95 - lightness(primary_surface_color)));

    let primary_text_color = rgb(0, 0, 0);
    let secondary_text_color = lighten(primary_text_color, lightness(primary_surface_color) * 0.3);

    let psc = rgb2hsl(primary_surface_color);
    psc.l = Math.max(0, lightness(tertiary_surface_color) - 0.05);
    psc.s = Math.min(1, s2 + psc.s);

    primary_surface_color = hsl2rgb(psc);

    return {
        primary_surface_color,
        secondary_surface_color,
        tertiary_surface_color,
        primary_text_color,
        secondary_text_color,
    }
}

var currentTimer: ReturnType<typeof setTimeout>;

export function setTheme({ temperature, is_light, oled }: ITheme, animate: boolean) {
    let colors = is_light ? genLightTheme(temperature) : genDarkTheme(temperature, oled);

    setThemeColors(colors, animate, is_light, oled);
}

export function setThemeColors(colors: IThemeColors, animate: boolean, is_light: boolean, oled: boolean) {
    let is_changing_light = LIGHT_THEME != is_light;

    LIGHT_THEME = is_light;

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

    let metaThemeColor = document.querySelector("meta[name=theme-color]");
    let appleThemeColor = document.querySelector("meta[name=apple-mobile-web-app-status-bar-style]");
    let color = formatRGBHex(colors.tertiary_surface_color);
    __DEV__ && console.log("Setting theme-color to", color);
    metaThemeColor?.setAttribute("content", color);

    if(oled && !is_light) {
        de.classList.add('ln-oled-theme');
        appleThemeColor?.setAttribute("content", "black");
    } else {
        de.classList.remove('ln-oled-theme');
        appleThemeColor?.setAttribute("content", color);
    }

    for(let key in colors) {
        let varname = "--ln-" + key.replace(/_/g, '-');
        let value = formatRGB(colors[key]);

        //console.log("Setting %s to %s", varname, value);
        de.style.setProperty(varname, value);
    }

    if(is_changing_light) {
        LIGHT_TIME = performance.now();
    }

    if(animate) {
        clearTimeout(currentTimer);
        currentTimer = setTimeout(() => {
            de.classList.remove("ln-theme-transition");
            __DEV__ && console.log("Theme transition ended");
        }, 1000);
    } else {
        LIGHT_TIME -= 1000;
    }
}

export var LIGHT_TIME: number = 0;

export function themeProgress(now: number): number {
    return Math.min(1, Math.max(0, (now - LIGHT_TIME) / 1000));
}
