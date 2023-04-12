
import { toHexCodePoints } from "./unicode";

const VARIATION_SELECTORS = /\uFE0F|\uFE0E/g,
    ZWJ = String.fromCharCode(0x200D);

/// Remove variant selectors, but only if there were ZWJ
export const minimize = (raw: string): string =>
    toHexCodePoints(raw.includes(ZWJ) ? raw : raw.replace(VARIATION_SELECTORS, ""));
