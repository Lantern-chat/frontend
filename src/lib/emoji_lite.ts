
import { toHexCodePoints } from "./unicode";

const UFE0Fg = /\uFE0F/g, U200D = String.fromCharCode(0x200D);

// if variant is present as \uFE0F
export const normalize = (raw: string): string => toHexCodePoints(raw.indexOf(U200D) < 0 ? raw.replace(UFE0Fg, '') : raw);
