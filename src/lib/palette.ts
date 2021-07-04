import { fnv1a } from "./fnv";

const DARK = ['goldenrod', 'royalblue', 'darkgreen', 'crimson', 'darkmagenta'];
const LIGHT = ['lightsalmon', 'lightblue', 'lightgreen', 'pink', 'plum'];

export function pickColorFromHash(value: string, light: boolean): string {
    let palette = light ? LIGHT : DARK;
    return palette[fnv1a(value) % palette.length];
}