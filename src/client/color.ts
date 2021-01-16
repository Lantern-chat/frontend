import { visibilityChange } from "src/ui/utils";

const BLACK: number[] = [0, 0, 0];

export interface IChangeColorOptions {
    saturation?: number,
    lightness?: number,
    hue?: number,
}

export function change_color(rgb: number[], { hue, saturation, lightness }: IChangeColorOptions): number[] {
    let [h, s, l] = rgb2hsl(rgb);
    h = hue ? hue : h;
    s = saturation ? saturation : s;
    l = lightness ? lightness : l;
    return hsl2rgb([h, s, l]);
}

export function linear2srgb([r, g, b]: number[]): number[] {
    let l2s = (u: number) => u <= 0.0031308 ? (12.92 * u) : (1.055 * Math.pow(u, 1 / 2.4) - 0.055);
    return [l2s(r) * 255, l2s(g) * 255, l2s(b) * 255];
}

export function srgb2linear([r, g, b]: number[]): number[] {
    let s2l = (u: number) => u <= 0.04045 ? (u / 12.92) : Math.pow((u + 0.055) / 1.055, 2.4);
    return [s2l(r / 255), s2l(g / 255), s2l(b / 255)];
}

export function hsl2rgb([h, s, l]: number[]): number[] {
    let a = s * Math.min(l, 1 - l);
    let f = (n: number, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return [f(0), f(8), f(4)];
}

export function hsv2rgb([h, s, v]: number[]): number[] {
    let f = (n: number, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
    return [f(5), f(3), f(1)];
}

export function rgb2hslv([r, g, b]: number[], hsv: boolean): number[] {
    let max = Math.max(r, g, b);

    let p: number[];
    switch(max) {
        case r: { p = [0, g - b]; break; }
        case g: { p = [2, b - r]; break; }
        case b: { p = [4, r - g]; break; }
        default: return BLACK; // NaNs
    }

    let min = Math.min(r, g, b);
    let c = max - min;
    let h = c === 0 ? 0 : 60 * (p[0] + p[1] / c);
    let s: number, lv = max;

    if(hsv) {
        s = lv === 0 ? 0 : c / lv;
    } else {
        lv = (min + max) / 2;
        s = (lv === 0 || lv === 1) ? 0 : (max - lv) / Math.min(lv, 1 - lv);
    }

    return [h, s, lv];
}

export function rgb2hsl(rgb: number[]): number[] {
    return rgb2hslv(rgb, false);
}

export function rgb2hsv(rgb: number[]): number[] {
    return rgb2hslv(rgb, true);
}

export function kelvin(temp: number): number[] {
    temp *= 0.01;

    let r, g, b = 255;

    if(temp <= 66) {
        r = 255;
        g = 99.4708025861 * Math.log2(temp) - 161.1195681661;
        b = temp <= 19 ? 0 : (138.5177312231 * Math.log2(temp - 10) - 305.0447927307);
    } else {
        temp -= 60;
        r = 329.698727446 * Math.pow(temp, -0.1332047592);
        g = 288.1221695283 * Math.pow(temp, -0.0755148492);
    }

    return [r, g, b];
}