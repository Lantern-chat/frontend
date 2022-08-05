//import * as d3 from "d3-color";
import { clamp_linear, formatRGB, linear2srgb, linear_srgb2oklab, oklab2linear_srgb, parseRgb, polar2lab, saturate_lab, srgb2linear } from "./color";
import { fnv1a } from "./fnv";
import { mix } from "./math";

//const DARK = ['goldenrod', 'royalblue', 'darkgreen', 'crimson', 'darkmagenta'];
//const PALETTE = ['#b8860b', '#4169e1', '#006400', '#dc143c', '#8b008b'].map(c => linear_srgb2oklab(srgb2linear(parseRgb(c))));
//const LIGHT = ['lightsalmon', 'lightblue', 'lightgreen', 'pink', 'plum'];

export function pickColorFromHash(value: string, light: boolean): string {
    //return (light ? LIGHT : DARK)[fnv1a(value) % DARK.length];

    let hue = fnv1a(value) % 14 / 7;
    let color = polar2lab(hue * Math.PI, 0.2, 0.5);

    //let color = PALETTE[fnv1a(value) % PALETTE.length];

    // adjust lightness for theme
    color.L = light ? mix(color.L, 0.8, 0.95) : mix(color.L, 0.5, 0.5);

    // adjust saturation for theme
    color = light ? saturate_lab(color, 0.9) : color;

    return formatRGB(clamp_linear(oklab2linear_srgb(color)), 1, true);
}