import { linear2srgb, linear_srgb2oklab, oklab2linear_srgb, pack_rgb, srgb2linear, formatRgbBinary, unpack_rgb } from "lib/color";
import { mix, smoothstep } from "lib/math";
import { Accessor, createMemo } from "solid-js";
import { usePrefs, UserPreferenceAccessors } from "state/contexts/prefs";

// maps from 0-1 to 0-0.5 on a curve
const K = 0.25;
function tonemap(x: number): number {
    return (1 + (K * x) * 0.5) * x / (K + x + x);
}

function Tonemap_Uchimura(x: number, P: number, a: number, m: number, l: number, c: number, b: number): number {
    // Uchimura 2017, "HDR theory and practice"
    // Math: https://www.desmos.com/calculator/gslcdxvipg
    // Source: https://www.slideshare.net/nikuque/hdr-theory-and-practicce-jp
    let l0 = ((P - m) * l) / a;
    let L0 = m - m / a;
    let L1 = m + (1.0 - m) / a;
    let S0 = m + l0;
    let S1 = m + a * l0;
    let C2 = (a * P) / (P - S1);
    let CP = -C2 / P;

    let w0 = 1.0 - m * smoothstep(x);
    let w2 = x < (m + l0) ? 0 : 1;
    let w1 = 1.0 - w0 - w2;

    let T = m * Math.pow(x / m, c) + b;
    let S = P - (P - S1) * Math.exp(CP * (x - S0));
    let L = m + a * (x - m);

    return T * w0 + L * w1 + S * w2;
}

function tonemap2(x: number): number {
    const P = 1.0;  // max display brightness
    const a = 1.0;  // contrast
    const m = 0.22; // linear section start
    const l = 0.4;  // linear section length
    const c = 1.33; // black
    const b = 0.0;  // pedestal
    return /*__INLINE__*/Tonemap_Uchimura(x, P, a, m, l, c, b) * 0.5;
}

export function adjustUserColor(color: number, prefs: UserPreferenceAccessors = usePrefs()): Accessor<number> {
    return createMemo(() => {
        if(prefs.ForceColorConstrast()) {
            let lab = linear_srgb2oklab(srgb2linear(unpack_rgb(color)));

            let L = tonemap(lab.L);

            if(prefs.LightMode()) {
                lab.L = L * 0.8 + 0.2;
            } else {
                lab.L = L * 0.8 + 0.6;
            }

            color = pack_rgb(linear2srgb(oklab2linear_srgb(lab)));
        }

        return color;
    });
}

export const formatColor = (color: number): Accessor<string> => () => formatRgbBinary(color);