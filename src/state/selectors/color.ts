import { linear2srgb, linear_srgb2oklab, oklab2linear_srgb, pack_rgb, srgb2linear, formatRgbBinary, unpack_rgb, clamp_linear, saturate_lab } from "lib/color";
import { Accessor } from "solid-js";
import { usePrefs, UserPreferenceAccessors } from "state/contexts/prefs";

export function adjustUserColor(color: number, prefs: UserPreferenceAccessors = usePrefs()): Accessor<number> {
    return () => {
        if(prefs.ForceColorConstrast()) {
            let lab = linear_srgb2oklab(srgb2linear(unpack_rgb(color))), is_light = prefs.LightMode();

            if(prefs.LightMode()) {
                if(lab.L > 0.6) {
                    lab.L = 0.6;
                    lab = saturate_lab(lab, 1.1);
                }
            } else {
                lab.L = Math.max(lab.L, 0.65);
            }

            color = pack_rgb(linear2srgb(clamp_linear(oklab2linear_srgb(lab))));
        }

        return color;
    };
}

export const formatColor = (color: number): Accessor<string> => () => formatRgbBinary(color);