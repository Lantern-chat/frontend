import { srgb2linear, linear2srgb, RGBColor } from "./color";

const { PI, sign, cos, abs, sqrt, round, min, max } = Math;

const BYTE_MASK: number = 0xFF;

function decode_dc(value: number): RGBColor {
    return srgb2linear({
        r: value >> 16,
        g: (value >> 8) & BYTE_MASK,
        b: value & BYTE_MASK
    });
}

function encode_dc(color: RGBColor): number {
    let { r, g, b } = linear2srgb(color);
    return (r << 16) | (g << 8) | b;
}

function decode_ac(value: number, max: number): RGBColor {
    let sign_sqr = (x: number) => max * sign(x) * (x * x) / 81;

    return {
        r: sign_sqr(((value / (19 * 19)) | 0) - 9),
        g: sign_sqr((((value / 19) | 0) % 19) - 9),
        b: sign_sqr((value % 19) - 9),
    }
}

function encode_ac({ r, g, b }: RGBColor, m: number): number {
    const A = 9, C = 18;

    let im = 1 / m,
        sign_sqrt = (x: number) => sqrt(abs(x)) * sign(x),
        k = (x: number): number => (min(C, max(0, round(sign_sqrt(x * im) * A + A))) | 0);

    return (k(r) * 19 * 19) + (k(g) * 19) + k(b);
}

export function decode(hash: ArrayBuffer, w: number, h: number, punch: number): Uint8ClampedArray {
    if(hash.byteLength < 6) throw "Invalid blurhash";
    let view = new DataView(hash),
        byte = 1; // avoid increment after q_max_value

    let size_flag = view.getUint8(byte); byte += 1;

    let cy = ((size_flag / 9) | 0) + 1,
        cx = ((size_flag % 9) | 0) + 1;

    let q_max_value = view.getInt8(byte - 1),
        max_value = (q_max_value + 1) / 166.0,
        num_colors = cx * cy,
        colors: RGBColor[] = new Array(num_colors),
        mc = max_value * punch,
        iw = PI / w,
        ih = PI / h,
        out = new Uint8ClampedArray(w * h * 4);

    colors[0] = decode_dc(view.getUint32(byte, true)); byte += 4;
    for(let i = 1; i < num_colors; i++) {
        colors[i] = decode_ac(view.getUint16(byte, true), mc); byte += 2;
    }

    for(let y = 0; y < h; y++) {
        for(let x = 0, p = y * w; x < w; x++) {
            let xf = x * iw,
                yf = y * ih,
                c: RGBColor = { r: 0, g: 0, b: 0 };

            for(let j = 0; j < cy; j++) {
                for(let i = 0, k = j * cx; i < cx; i++) {
                    let idx = i + k, basis = cos(xf * i) * cos(yf * j);

                    c.r += colors[idx].r * basis;
                    c.g += colors[idx].g * basis;
                    c.b += colors[idx].b * basis;
                }
            }

            let idx = 4 * (x + p), cl = linear2srgb(c);
            out[idx] = cl.r;
            out[idx + 1] = cl.g;
            out[idx + 2] = cl.b;
            out[idx + 3] = 255;
        }
    }

    return out;
}

function multiply_basis_function(xc: number, yc: number, w: number, h: number, rgb: number[]): RGBColor {
    let r, g, b = g = r = 0,
        nx = PI * xc / w,
        ny = PI * yc / h;

    for(let y = 0; y < h; y++) {
        for(let x = 0; x < w; x++) {
            let basis = cos(x * nx) * cos(y * ny),
                i = 3 * (x + y * w);

            let c = srgb2linear({ r: rgb[i], g: rgb[i + 1], b: rgb[i + 2] });

            r += basis * c.r;
            g += basis * c.g;
            b += basis * c.b;
        }
    }

    let scale = 1 / (w * h);

    return {
        r: r * scale,
        g: g * scale,
        b: b * scale,
    };
}