import { u8srgb2linear, linear2srgbu8, RGBColor } from "./color";

const { PI, sign, cos, abs, sqrt, round, min, max } = Math;

const BYTE_MASK: number = 0xFF;

function decode_dc(value: number): RGBColor {
    return u8srgb2linear({
        r: value >> 16,
        g: (value >> 8) & BYTE_MASK,
        b: value & BYTE_MASK
    });
}

function encode_dc(color: RGBColor): number {
    let { r, g, b } = linear2srgbu8(color);
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

    colors[0] = decode_dc(view.getUint32(byte)); byte += 4;
    for(let i = 1; i < num_colors; i++) {
        colors[i] = decode_ac(view.getUint16(byte), mc); byte += 2;
    }

    for(let y = 0; y < h; y++) {
        for(let x = 0, p = y * w; x < w; x++) {
            let xf = x * iw,
                yf = y * ih,
                c: RGBColor = { r: 0, g: 0, b: 0 };

            for(let j = 0; j < cy; j++) {
                let basis_y = cos(yf * j);

                for(let i = 0, k = j * cx; i < cx; i++) {
                    let idx = i + k, basis = cos(xf * i) * basis_y;

                    c.r += colors[idx].r * basis;
                    c.g += colors[idx].g * basis;
                    c.b += colors[idx].b * basis;
                }
            }

            let idx = 4 * (x + p), cl = linear2srgbu8(c);
            out[idx] = cl.r;
            out[idx + 1] = cl.g;
            out[idx + 2] = cl.b;
            out[idx + 3] = 255;
        }
    }

    return out;
}

// bpp = bytes per pixel, which is 4 with alpha channel
function multiply_basis_function(xc: number, yc: number, w: number, h: number, rgb: Uint8Array, bpp: number): RGBColor {
    let r, g, b = g = r = 0,
        nx = PI * xc / w,
        ny = PI * yc / h,
        scale = 1 / (w * h); // NOTE: This noramlization differs from reference, because I think it looks better

    for(let y = 0; y < h; y++) {
        let basis_y = cos(y * ny);

        for(let x = 0; x < w; x++) {
            let basis = cos(x * nx) * basis_y,
                i = bpp * (x + y * w);

            let c = u8srgb2linear({ r: rgb[i], g: rgb[i + 1], b: rgb[i + 2] });

            r += basis * c.r;
            g += basis * c.g;
            b += basis * c.b;
        }
    }

    return {
        r: r * scale,
        g: g * scale,
        b: b * scale,
    };
}

function roundup4(len: number): number {
    return (len + 3) & ~0x03;
}

export function encode(xc: number, yc: number, w: number, h: number, rgb: Uint8Array): ArrayBuffer {
    xc = min(9, max(1, xc));
    yc = min(9, max(1, yc));

    // size_flag = 1 byte
    // q_max_value = 1 byte
    // (dc + ac) = 2 bytes + (2 * xc * yc) bytes, dc takes an extra 2 bytes

    let buf_size = roundup4(4 + xc * yc * 2),
        buffer = new ArrayBuffer(buf_size),
        data = new DataView(buffer),
        size_flag = (yc - 1) * 9 + (xc - 1),
        factors: RGBColor[] = [];

    for(let y = 0; y < yc; y++) {
        for(let x = 0; x < xc; x++) {
            factors.push(multiply_basis_function(xc, yc, w, h, rgb, 4));
        }
    }

    let dc = factors[0],
        ac = factors.slice(1),
        max_value = 1,
        // serves as both the real max when searching and as the written value
        actual_max = 0;

    if(ac.length) {
        for(let i = 0; i < ac.length; i++) {
            let { r, g, b } = ac[i];
            actual_max = max(actual_max, r, g, b);
        }

        // quantize max and reassign it for writing to the buffer
        actual_max = max(0, min(82, actual_max * 166.0 - 0.5)) | 0;

        // compute max for encoding
        max_value = (actual_max + 1) / 166.0;
    }

    data.setUint8(0, size_flag); // 1 byte
    data.setInt8(1, actual_max); // 1 byte
    data.setUint32(2, encode_dc(dc)); // 4 bytes

    for(let i = 0; i < ac.length; i++) {
        // AC starts at 6 bytes, iterating by 2i bytes (i + i)
        data.setUint16(6 + i + i, encode_ac(ac[i], max_value));
    }

    return buffer;
}