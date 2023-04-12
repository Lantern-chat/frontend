import { minimize } from "./emoji_lite";

//https://stackoverflow.com/a/64396666/2083075
//const pEMOJI = /(?:[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{1F9B0}-\u{1F9B3}]|(?:[\*0-9#](?=\u{FE0F})))/u;

export const EMOJI_RE = /\p{RI}\p{RI}|\p{Emoji}(?:\p{EMod}|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?(?:\u{200D}(?:\p{RI}\p{RI}|\p{Emoji}(?:\p{EMod}|\u{FE0F}\u{20E3}?|[\u{E0020}-\u{E007E}]+\u{E007F})?))*/u;

const NOT_EMOJI = /^[\*#0-9]$/;

export function find_emoji(s: string, re: RegExp = EMOJI_RE): RegExpExecArray | null {
    let m = re.exec(s);

    if(m && NOT_EMOJI.test(m[0])) {
        return null;
    }

    return m;
}

//export const EMOJI_RE = new RegExp(EMOJI_RE_BASE.source.replace(/\\p\{Emoji\}/g, EMOJI.source), "u");

// above, but matches the start of the line
export const EMOJI_RE0: RegExp = new RegExp("^(?:" + EMOJI_RE.source + ")", EMOJI_RE.flags);

export interface IEmoji {
    e: string,
    s: boolean,
    c: number,
    a: Array<string>,
    t?: Array<string>,
}

// TODO: Find a way to deallocate inner JSON string after use
import RAW_EMOJIS from "lantern-emoji/dist/emojis.json";

export const CATEGORIES = RAW_EMOJIS.c;
export var EMOJIS: Array<IEmoji> = [];
export var ALIASES_REV: Map<string, string> = new Map();

var NORM_EMOJIS_MAP: Map<string, IEmoji> = new Map();

export function decode_emojis() {
    if(EMOJIS.length == 0) {
        let fully_packed_emojis = RAW_EMOJIS.e;

        for(let packed_emoji of fully_packed_emojis.split("|")) {
            let [e, c, aliases, tags] = packed_emoji.split(",") as [e: string, c: number, aliases: string, tags?: string];

            let emoji = { e, c: Math.abs(c) - 1, s: c < 0, a: aliases.split(" "), t: tags?.split(" ") };

            EMOJIS.push(emoji);
            NORM_EMOJIS_MAP.set(minimize(emoji.e), emoji);

            for(let alias of emoji.a) {
                ALIASES_REV.set(alias, emoji.e);
            }
        }

        // free up memory, maybe
        RAW_EMOJIS.e = null!;
        RAW_EMOJIS.c = null!;
    }
}

export function get_emoji(e: string): IEmoji | undefined {
    decode_emojis();

    return NORM_EMOJIS_MAP.get(minimize(e));
}

export const SKIN_TONES = ["", "🏻", "🏼", "🏽", "🏾", "🏿"];
export const SKIN_TONES_HEX = ["#FFDC5D", "#F7DECE", "#F3D2A2", "#D5AB88", "#AF7E57", "#7C533E"];

export type SKIN_TONE_MODIFIER = undefined | 0 | 1 | 2 | 3 | 4 | 5;

export function emoji_with_skin_tone(e: string, tone?: SKIN_TONE_MODIFIER): string {
    decode_emojis();

    if(tone && tone < 6) {
        e = emoji_without_skin_tone(e)[0];

        if(NORM_EMOJIS_MAP.get(minimize(e))?.s) {
            e += SKIN_TONES[tone];
        }
    }

    return e;
}

const ENDS_WITH_SKIN_TONE = new RegExp(`(${SKIN_TONES.slice(1).join("|")})$`);

export function emoji_without_skin_tone(e: string): [emoji: string, modifier?: SKIN_TONE_MODIFIER] {
    let m = ENDS_WITH_SKIN_TONE.exec(e);
    return m ? [e.slice(0, e.length - m[1].length), SKIN_TONES.indexOf(m[1]) as SKIN_TONE_MODIFIER] : [e];
}

export function format_emoji_shortcode(value: string, no_modifier: boolean = false): string | undefined {
    decode_emojis();

    let p = ":", s = p, // prefix and suffix
        [v, modifier] = no_modifier ? [value] : emoji_without_skin_tone(value),
        e = NORM_EMOJIS_MAP.get(minimize(v));

    if(e?.a.length) {
        if(modifier) {
            // set suffix
            s = "::skin-tone-" + modifier.toString() + s;
        }

        return p + e.a[0] + s;
    }
    return;
}