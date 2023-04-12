//import * as d3 from "d3-color";
import { clamp_linear, formatRGB, formatRGBHex, lighten_lab, linear2srgbu8, linear_srgb2oklab, oklab2linear_srgb, parseRgb, polar2lab, saturate_lab, u8srgb2linear } from "./color";
import { fnv1a } from "./fnv";
import { mix } from "./math";

//const DARK = ["goldenrod", "royalblue", "darkgreen", "crimson", "darkmagenta"];
const PALETTE = ["#b8860b", "#4169e1", "#006400", "#dc143c", "#8b008b"].map(c => {
    let l = linear_srgb2oklab(u8srgb2linear(parseRgb(c)));
    l.L = 1;
    return saturate_lab(l, 1 / Math.hypot(l.a, l.b) * 0.2);
});
//const LIGHT = ["lightsalmon", "lightblue", "lightgreen", "pink", "plum"];

//const PALETTE_SIZE = 6;
//const PALETTE = Array.from({ length: PALETTE_SIZE }, (_, i) => polar2lab(i / PALETTE_SIZE * 2 * Math.PI + 0.2, 0.3, 1));

const DARK = PALETTE.map(c => formatRGBHex(clamp_linear(oklab2linear_srgb(lighten_lab(c, 0.5))), true));
const LIGHT = PALETTE.map(c => formatRGBHex(clamp_linear(oklab2linear_srgb(lighten_lab(saturate_lab(c, 0.75), 0.75))), true));

export function pickColorFromHash(value: string, light: boolean): string {
    return (light ? LIGHT : DARK)[fnv1a(value) % PALETTE.length];

    let color = PALETTE[fnv1a(value) % PALETTE.length];

    // adjust lightness for theme
    color.L = light ? mix(color.L, 0.8, 0.95) : mix(color.L, 0.5, 0.5);

    // adjust saturation for theme
    color = light ? saturate_lab(color, 0.9) : color;

    return formatRGB(clamp_linear(oklab2linear_srgb(color)), 1, true);
}