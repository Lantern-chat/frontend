interface FreeState {
    // consecutive_spoiler
    cs: number,
    // consecutive_code
    cc: number,
    // flags
    f: number,
    // position
    p: number,

    // prefixes that make it not free
    r: string[],
}

const INSIDE_CODE_BLOCK: number = 1 << 0;
const INSIDE_SPOILER: number = 1 << 1;
const INSIDE_INLINE_CODE: number = 1 << 2;
const INSIDE_ANY_CODE: number = INSIDE_CODE_BLOCK | INSIDE_INLINE_CODE;
const INSIDE_EMOTE: number = 1 << 3;
const ESCAPED: number = 1 << 4;

const DEFAULT_FREE_FLAGS: number = INSIDE_INLINE_CODE | INSIDE_SPOILER | INSIDE_INLINE_CODE;
const DEFAULT_PREFIXES: string[] = ["<", "\\", ":"];

export function create(prefixes: string[] = DEFAULT_PREFIXES): FreeState {
    return { cs: 0, cc: 0, f: 0, p: 0, r: prefixes };
}

const VALID_EMOTE_CHAR: RegExp = /[\w\-]/;

export function incr(self: FreeState, input: string, new_position: number) {
    let c, i, { f, cc, cs, p } = self;

    input = input.slice(p, new_position);

    for(i = 0; i < input.length; i += 1) {
        if(f & ESCAPED) {
            f &= ~ESCAPED; continue;
        }

        c = input[i];

        if(c == "\\") {
            f |= ESCAPED; continue;
        }

        if(c == "`") {
            cc++;
        } else {
            // if this character is not part of a code token,
            // but there were two consecitive code tokens,
            // then it was probably a zero-length inline code span
            if(cc == 2 && !(f & INSIDE_CODE_BLOCK)) {
                f ^= INSIDE_INLINE_CODE;
            }

            cc = 0;
        }

        if(c == "|") {
            cs++;
        } else {
            cs = 0;
        }

        if(cc == 3) {
            // toggle code block flag
            f ^= INSIDE_CODE_BLOCK;

            // remove inline code flag
            f &= ~INSIDE_INLINE_CODE;
        } else {
            if(!(f & INSIDE_CODE_BLOCK)) {
                // if does not contain code block flag

                if(cc == 1) {
                    f ^= INSIDE_INLINE_CODE;
                }

                if(cs == 2) {
                    f ^= INSIDE_SPOILER;
                }
            }

            // if not in any code
            if(!(f & INSIDE_ANY_CODE)) {
                if(c == ":") {
                    f ^= INSIDE_EMOTE;
                } else if(!VALID_EMOTE_CHAR.test(c)) {
                    f &= ~INSIDE_EMOTE;
                }
            }
        }
    }

    self.p = new_position;
    self.f = f;
    self.cc = cc;
    self.cs = cs;
}

export function is_free(self: FreeState, input: string, new_position: number, flags: number = DEFAULT_FREE_FLAGS): boolean {
    // start of the string is trivially free
    if(new_position == 0) return true;

    // if the position is prefixed by escaped
    if(self.r.includes(input[new_position - 1])) return false;

    incr(self, input, new_position);

    // if the flags intersect
    if((self.f & flags) != 0) return false;

    return true;
}

export function is_free_simple(input: string, position: number, prefixes: string[] = DEFAULT_PREFIXES, flags: number = DEFAULT_FREE_FLAGS): boolean {
    return is_free(create(prefixes), input, position, flags);
}

export function is_inside_code(input: string, position: number): boolean {
    if(position == 0) return false;

    let f = create([]);

    incr(f, input, position);

    return !!(f.f & (INSIDE_INLINE_CODE | INSIDE_CODE_BLOCK));
}

export function is_inside_spoiler(input: string, position: number): boolean {
    if(position == 0) return false;

    let f = create([]);
    incr(f, input, position);

    return !!(f.f & INSIDE_SPOILER);
}

export function emote_start(input: string, position: number): number {
    let start = position;

    while(start > 0 && input[start] != ":") { start--; }

    let is_valid = /^:[\w\-]*$/.test(input.slice(start, position)) &&
        input.slice(0, position).match(/:/g)!.length % 2 == 1;

    return is_valid ? start : -1;
}

export const enum SpanType {
    None,
    InlineCode,
    BlockCode,
    InlineMath,
    BlockMath,
    Url,
    CustomEmote,
    UserMention,
    RoomMention,
    Spoiler,
    EmoteName,
}

// NOTE: This is slightly different from the backend version, in that the start+end range includes
// the delimiters, but the `v` value is present that excludes them. Was easier this way.
export interface MdSpan {
    type: SpanType,
    start: number,
    len: number,
    value: string,
    spoilered?: boolean,
}

interface Rule {
    r: RegExp,
    t: SpanType;
}

const RULES: Array<Rule> = [
    {
        r: /^<@(\d+)>/,
        t: SpanType.UserMention,
    },
    {
        r: /^<#(\d+)>/,
        t: SpanType.RoomMention,
    },
    {
        r: /^<:(\w*:\d+)>/,
        t: SpanType.CustomEmote,
    },
    {
        r: /^:(\w+):/,
        t: SpanType.EmoteName,
    },
    {
        r: /^\|\|([^]*?)\|\|/,
        t: SpanType.Spoiler,
    },
    {
        r: /^```([^`][^]*?)\n```/,
        t: SpanType.BlockCode
    },
    {
        r: /^`([^`\n]+)`/,
        t: SpanType.InlineCode,
    },
];

export function scan_markdown(input: string, spans: MdSpan[] = [], offset: number = 0): MdSpan[] {
    let i = -1, slice, m: RegExpExecArray | null;
    while(slice = input.slice(++i)) {
        for(let rule of RULES) {
            if(m = rule.r.exec(slice)) {
                let start = i + offset, len = m[0].length;

                spans.push({
                    type: rule.t,
                    start,
                    len,
                    value: m[1],
                });

                if(rule.t == SpanType.Spoiler) {
                    let j = spans.length;

                    scan_markdown(m[1], spans, i + 2);

                    for(let span of spans.slice(j)) {
                        span.spoilered = true;
                    }
                }

                i += len;
            }
        }
    }

    return spans;
}