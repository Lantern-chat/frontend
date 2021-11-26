const { min, max, round } = Math;

const clamp01 = (x: number) => min(1, max(0, x));
const clamp0360 = (x: number) => max(0, x % 360);

const DEGREES = 360;

export interface IChangeColorOptions {
    h?: number,
    s?: number,
    l?: number,
}

export type Color = RGBColor | HSVColor | HSLColor;

export const rgb = (r: number, g: number, b: number): RGBColor => ({ r, g, b });
export interface RGBColor {
    r: number,
    g: number,
    b: number,
}

export const hsv = (h: number, s: number, v: number): HSVColor => ({ h, s, v });
export interface HSVColor {
    h: number,
    s: number,
    v: number,
}

export const hsl = (h: number, s: number, l: number): HSLColor => ({ h, s, l });
export interface HSLColor {
    h: number,
    s: number,
    l: number,
}

export function any2rgb(color: Color): RGBColor {
    let c = color as any;
    if(c.r !== undefined) {
        return c;
    }
    else if(c.v !== undefined) {
        return hsv2rgb(c);
    }
    else if(c.l !== undefined) {
        return hsl2rgb(c);
    }
    else return rgb(0, 0, 0);
}

export function any2hsv(color: Color): HSVColor {
    let c = color as any;
    if(c.r !== undefined) {
        return rgb2hsv(c);
    }
    else if(c.v !== undefined) {
        return c;
    }
    else if(c.l !== undefined) {
        return hsl2hsv(c);
    }
    else return hsv(0, 0, 0);
}

export function any2hsl(color: Color): HSLColor {
    let c = color as any;
    if(c.r !== undefined) {
        return rgb2hsl(c);
    }
    else if(c.v !== undefined) {
        return hsv2hsl(c);
    }
    else if(c.l !== undefined) {
        return c;
    }
    else return hsl(0, 0, 0);
}

export function hsl2rgb({ h, s, l }: HSLColor): RGBColor {
    let a = s * min(l, 1 - l),
        f = (n: number, k = (n + h / 30) % 12) => l - a * max(min(k - 3, 9 - k, 1), -1);
    return { r: f(0), g: f(8), b: f(4) };
}

export function hsv2rgb({ h, s, v }: HSVColor): RGBColor {
    let f = (n: number, k = (n + h / 60) % 6) => v - v * s * max(min(k, 4 - k, 1), 0);
    return rgb(f(5), f(3), f(1));
}

function rgb2hslv({ r, g, b }: RGBColor, is_hsv: boolean): HSVColor | HSLColor {
    let maximum = max(r, g, b);

    let p: number[];
    switch(maximum) {
        case r: { p = [0, g - b]; break; }
        case g: { p = [2, b - r]; break; }
        case b: { p = [4, r - g]; break; }
        default: return is_hsv ? hsv(0, 0, 0) : hsl(0, 0, 0); // NaNs
    }

    let minimum = min(r, g, b),
        c = maximum - minimum,
        h = c === 0 ? 0 : 60 * (p[0] + p[1] / c),
        lv = maximum,
        constructor,
        s: number;

    if(is_hsv) {
        s = lv === 0 ? 0 : c / lv;
        constructor = hsv;
    } else {
        lv = (minimum + maximum) / 2;
        s = (lv === 0 || lv === 1) ? 0 : (maximum - lv) / min(lv, 1 - lv);
        constructor = hsl;
    }

    return constructor(h, s, lv);
}

export function hsl2hsv({ h, s, l }: HSLColor): HSVColor {
    let v = l + s * min(l, 1 - l);
    return hsv(h, v == 0 ? 0 : 2 * (1 - l / v), v);
}

export function hsv2hsl({ h, s, v }: HSVColor): HSLColor {
    let l = v * (1 - s * 0.5);
    return hsl(h, (l == 0 || l == 1) ? 0 : (v - l) / min(l, 1 - l), l);
}

export function rgb2hsl(rgb: RGBColor): HSLColor {
    return rgb2hslv(rgb, false) as HSLColor;
}

export function rgb2hsv(rgb: RGBColor): HSVColor {
    return rgb2hslv(rgb, true) as HSVColor;
}

export function change_color(rgb: RGBColor, { h: hue, s: saturation, l: lightness }: IChangeColorOptions): RGBColor {
    let { h, s, l } = rgb2hsl(rgb),
        k = (v: number, s: number | undefined) => s !== undefined ? clamp01(s) : v;

    return hsl2rgb({
        h: hue != undefined ? hue : h,
        s: k(s, saturation),
        l: k(l, lightness),
    });
}

export function adjust_color(rgb: RGBColor, { h: hue, s: saturation, l: lightness }: IChangeColorOptions): RGBColor {
    let { h, s, l } = rgb2hsl(rgb),
        k = (v: number, s: number | undefined) => s !== undefined ? clamp01(s + v) : v;

    return hsl2rgb({
        h: hue != undefined ? clamp0360(h + hue) : h,
        s: k(s, saturation),
        l: k(l, lightness),
    });
}

export function scale_color(rgb: RGBColor, { h: hue, s: saturation, l: lightness }: IChangeColorOptions): RGBColor {
    let { h, s, l } = rgb2hsl(rgb),
        j = (v: number, s: number) => v + s * (s > 0 ? 1 - s : s),
        k = (v: number, s: number | undefined) => s !== undefined ? clamp01(j(v, s)) : v;

    return hsl2rgb({
        h: hue != undefined ? clamp0360(j(hue, h)) : h,
        s: k(s, saturation),
        l: k(l, lightness),
    });
}

export function hue(color: Color): number {
    return any2hsl(color).h;
}

export function saturation(color: Color): number {
    return any2hsl(color).s;
}

export function lightness(color: Color): number {
    return any2hsl(color).l;
}



export function lighten(rgb: RGBColor, amount: number): RGBColor {
    return adjust_color(rgb, {
        l: amount,
    });
}

export function darken(rgb: RGBColor, amount: number): RGBColor {
    return lighten(rgb, -amount);
}

export function saturate(rgb: RGBColor, amount: number): RGBColor {
    return adjust_color(rgb, {
        s: amount,
    });
}

export function desaturate(rgb: RGBColor, amount: number): RGBColor {
    return saturate(rgb, -amount);
}

export function normalize({ r, g, b }: RGBColor): RGBColor {
    let v = max(r, g, b);
    let iv = v > 0 ? 1 / v : 0;
    return rgb(r * iv, g * iv, b * iv);
}



function linear2u8({ r, g, b }: RGBColor): RGBColor {
    let l2u = (u: number) => min(255, max(0, 255 * u)) | 0;
    return { r: l2u(r), g: l2u(g), b: l2u(b) };
}
function u82linear({ r, g, b }: RGBColor): RGBColor {
    let k = (x: number) => x /= 255.0;
    return { r: k(r), g: k(g), b: k(b) }
}

/// Transforms a linear (0-1) RGB color into sRGB 0-255 (inclusive)
export function linear2srgb({ r, g, b }: RGBColor): RGBColor {
    let l2s = (u: number) => u <= 0.0031308 ? (12.92 * u) : (1.055 * Math.pow(u, 1 / 2.4) - 0.055);
    return linear2u8({ r: l2s(r), g: l2s(g), b: l2s(b) });
}
function linearsrgb2linear({ r, g, b }: RGBColor): RGBColor {
    let s2l = (u: number) => u <= 0.04045 ? (u / 12.92) : Math.pow((u + 0.055) / 1.055, 2.4);
    return { r: s2l(r), g: s2l(g), b: s2l(b) };
}
export function srgb2linear(c: RGBColor): RGBColor {
    return linearsrgb2linear(u82linear(c));
}






// https://tannerhelland.com/2012/09/18/convert-temperature-rgb-algorithm-code.html
export function kelvin(temp: number): RGBColor {
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

    // TODO: Check if this is correct? Original only returned 0-255, unsure if sRGB
    return srgb2linear({ r, g, b });
}


const BLACKBODY_TABLE_R = [
    [2.52432244e+03, -1.06185848e-03, 3.11067539e+00],
    [3.37763626e+03, -4.34581697e-04, 1.64843306e+00],
    [4.10671449e+03, -8.61949938e-05, 6.41423749e-01],
    [4.66849800e+03, 2.85655028e-05, 1.29075375e-01],
    [4.60124770e+03, 2.89727618e-05, 1.48001316e-01],
    [3.78765709e+03, 9.36026367e-06, 3.98995841e-01],
];

const BLACKBODY_TABLE_G = [
    [-7.50343014e+02, 3.15679613e-04, 4.73464526e-01],
    [-1.00402363e+03, 1.29189794e-04, 9.08181524e-01],
    [-1.22075471e+03, 2.56245413e-05, 1.20753416e+00],
    [-1.42546105e+03, -4.01730887e-05, 1.44002695e+00],
    [-1.18134453e+03, -2.18913373e-05, 1.30656109e+00],
    [-5.00279505e+02, -4.59745390e-06, 1.09090465e+00],
];

let z = [0, 0, 0, 0];
const BLACKBODY_TABLE_B = [
    z, z, z,
    [-2.02524603e-11, 1.79435860e-07, -2.60561875e-04, -1.41761141e-02],
    [-2.22463426e-13, -1.55078698e-08, 3.81675160e-04, -7.30646033e-01],
    [6.72595954e-13, -2.73059993e-08, 4.24068546e-04, -7.52204323e-01],
];

export function kelvin2(t: number): RGBColor {
    if(t >= 12000) {
        return rgb(0.826270103, 0.994478524, 1.56626022);
    } else if(t < 965.0) {
        return rgb(4.70366907, 0, 0);
    }

    let i = (t >= 6365.0) ? 5 :
        (t >= 3315.0) ? 4 :
            (t >= 1902.0) ? 3 : (t >= 1449.0) ? 2 : (t >= 1167.0) ? 1 : 0;

    let r = BLACKBODY_TABLE_R[i];
    let g = BLACKBODY_TABLE_G[i];
    let b = BLACKBODY_TABLE_B[i];

    let t_inv = 1 / t;

    return normalize(rgb(
        r[0] * t_inv + r[1] * t + r[2],
        g[0] * t_inv + g[1] * t + g[2],
        ((b[0] * t + b[1]) * t + b[2]) * t + b[3]
    ));
}


export function formatRGB(c: RGBColor, alpha?: number, srgb?: boolean): string {
    if(__DEV__) {
        let l = (v: number): boolean => v < 0.0 || v > 1.0;
        if(l(c.r) || l(c.g) || l(c.b)) console.log("Invalid color: ", c);
    }

    let { r, g, b } = srgb ? linear2srgb(c) : linear2u8(c),
        rgb = [r, g, b],
        prefix = 'rgb';

    if(alpha !== undefined) {
        rgb.push(alpha);
        prefix += 'a';
    }

    return prefix + `(${rgb.join(',')})`;
}

export function formatRgbBinary(value: number): string {
    let r = value & 0xff, g = (value >> 8) & 0xff, b = (value >> 16) & 0xff;

    return 'rgb(' + [r, g, b].join(',') + ')';
}