import { change_color, kelvin, darken, lighten, lightness, RGBColor, desaturate, adjust_color, kelvin2 } from "./color";

const { min, max, round } = Math;

export interface ITheme {
    primary_surface_color: RGBColor,
    secondary_surface_color: RGBColor,
    tertiary_surface_color: RGBColor,
    primary_text_color: RGBColor,
    secondary_text_color: RGBColor,
}

const MIN_TEMP: number = 965.0;
const MAX_TEMP: number = 12000;

let clamp_temp = (temp: number): number => min(MAX_TEMP, max(MIN_TEMP, temp));

export var LIGHT_THEME: boolean = false;

export function genDarkTheme(temperature: number): ITheme {

    LIGHT_THEME = false;

    temperature = clamp_temp(temperature);
    let k = kelvin2(temperature);

    let s = (temperature - 7000) / 20000;
    s *= s;
    s += 0.05;

    //console.log("saturation: ", s);

    let primary_surface_color = change_color(k, { lightness: 0.2, saturation: s });
    let secondary_surface_color = darken(primary_surface_color, 0.05);
    let tertiary_surface_color = lighten(primary_surface_color, 0.05);

    let primary_text_color = change_color(primary_surface_color, {
        saturation: 0,
        lightness: 1.1 - lightness(primary_surface_color),
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

    let primary_surface_color = change_color(k, { saturation: s, lightness: l });
    let secondary_surface_color = adjust_color(primary_surface_color, { lightness: -0.05, saturation: -0.4 });
    let primary_text_color = change_color(primary_surface_color, {
        saturation: 0,
        lightness: 1.0 - lightness(primary_surface_color),
    });
    let secondary_text_color = lighten(primary_text_color, 0.1);

    return {
        primary_surface_color,
        secondary_surface_color,
        tertiary_surface_color: { r: 1, g: 1, b: 1 },
        primary_text_color,
        secondary_text_color,
    }
}

export function setTheme(theme: ITheme, animate: boolean) {
    if(animate) {
        document.documentElement.classList.add("ln-theme-transition");
    }

    for(let key in theme) {
        let varname = "--ln-" + key.replace(/_/g, '-');
        let { r, g, b } = theme[key];
        let value = `rgb(${round(r * 255)}, ${round(g * 255)}, ${round(b * 255)})`;

        console.log("Setting %s to %s", varname, value);
        document.documentElement.style.setProperty(varname, value);
    }

    if(animate) {
        setTimeout(() => {
            document.documentElement.classList.remove("ln-theme-transition");
        }, 2000);
    }
}

(window as any).setDarkTheme = function(temperature: number) {
    setTheme(genDarkTheme(temperature), true);
};

(window as any).setLightTheme = function(temperature: number) {
    setTheme(genLightTheme(temperature), true);
};