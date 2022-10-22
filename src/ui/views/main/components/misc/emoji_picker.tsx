import { CATEGORIES, decode_emojis, EMOJIS, emoji_with_skin_tone, format_emoji_shortcode, IEmoji, SKIN_TONES_HEX, SKIN_TONE_MODIFIER } from "lib/emoji";
import { batch, createEffect, createMemo, createRenderEffect, createSelector, createSignal, onMount, Show } from "solid-js";
import { usePrefs } from "state/contexts/prefs";
import { EmojiLite } from "ui/components/common/emoji_lite";
import { VectorIcon } from "ui/components/common/icon";
import { Icons } from "lantern-icons";
import { createRef } from "ui/hooks/createRef";
import { Snowflake } from "state/models"

import { cleanedEvent } from "ui/directives/bugs";
false && cleanedEvent;

export interface IEmojiPickerProps {
    onPick(emoji: string | null, emote: Snowflake | null): void;
}

const unkebab = (c: string): string => c.replace(/\b[a-z]/g, m => m.toUpperCase()).replace(/\-/g, ' ');

interface IFormattedCategory {
    p: string, c: string,
    e: IEmoji[],
}

var FORMATTED_CATEGORIES: IFormattedCategory[] = [];
function gen_formatted() {
    if(FORMATTED_CATEGORIES.length == 0) {
        decode_emojis();

        FORMATTED_CATEGORIES = CATEGORIES.map((c, ci) => {
            return {
                p: unkebab(c),
                c,
                e: EMOJIS.filter(e => e.c == ci),
            }
        });
    }
}

import "./emoji_picker.scss";
export function EmojiPicker(props: IEmojiPickerProps) {
    gen_formatted();

    const prefs = usePrefs();

    let [tone, setTone] = createSignal<SKIN_TONE_MODIFIER>(JSON.parse(localStorage.getItem('SKIN_TONE') || '0'));
    createEffect(() => localStorage.setItem('SKIN_TONE', JSON.stringify(tone())));

    let [category, setCategory] = createSignal(0);
    let [search, setSearch] = createSignal("");

    let selected = createSelector(category);

    let input: HTMLInputElement | undefined;

    onMount(() => !prefs.UseMobileView() && input?.focus());

    let on_category = (idx: number) => batch(() => {
        setCategory(idx);
        setSearch('');
    });

    let clear_search = () => {
        setSearch('');
        input?.focus();
    };

    let on_esc = (e: KeyboardEvent) => {
        if(e.key == 'Escape') { setSearch(''); }
    };

    let has_search = createMemo(() => !!search());

    return (
        <div class="ln-emoji-picker">
            <div class="ln-emoji-picker__search">
                <div class="ln-emoji-picker__search-input">
                    <input ref={input} type="text" placeholder="Search" value={search()}
                        onInput={e => setSearch(e.currentTarget.value.trim().toLowerCase())} onKeyUp={on_esc} />
                    <Show when={has_search()}>
                        <span onClick={clear_search}>
                            <VectorIcon id={Icons.Close} />
                        </span>
                    </Show>
                </div>

                <div class="ln-emoji-picker__tone">
                    <div class="ln-emoji-picker__tone-wrapper">
                        <span style={{ "background-color": SKIN_TONES_HEX[tone()!] }} />
                        <div class="ln-emoji-picker__tone-options">
                            {SKIN_TONES_HEX.map((h, i) => (
                                i != tone() ? <span style={{ "background-color": h }}
                                    onClick={() => setTone(i as SKIN_TONE_MODIFIER)} /> : null
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div class="ln-emoji-picker__picker">
                <div class="ln-emoji-picker__categories ln-scroll-y">
                    {FORMATTED_CATEGORIES.map(({ p, e }, idx) => {
                        return (
                            <div title={p} onClick={() => on_category(idx)} classList={{
                                'selected': selected(idx) && !search(),
                            }}>
                                <EmojiLite value={emoji_with_skin_tone(e[0].e, tone())} />
                            </div>
                        )
                    })}
                </div>

                <PickerCategory {...props} c={category()} all={has_search()} search={search()} tone={tone()} />
            </div>
        </div>
    );
}

function PickerCategory(props: IEmojiPickerProps & { c: number, all?: boolean, search: string, tone: SKIN_TONE_MODIFIER }) {
    let first_letter = createMemo(() => props.search.slice(0, 1));

    let emojis = createMemo(() => {
        let e: Array<IEmoji & { b?: string }> = props.all ? EMOJIS : FORMATTED_CATEGORIES[props.c].e;

        __DEV__ && console.log("Recomputing emoji list");

        // pull this out of loop to avoid hundreds of reactive dependencies
        let tone = props.tone, filter = first_letter();

        if(filter) {
            e = e.filter(x => {
                x.b ||= (x.t ? x.t.concat(x.a) : x.a).join(' ');
                return x.b.includes(filter);
            });
        }

        return e.map(e => {
            let et = emoji_with_skin_tone(e.e, tone);

            return (
                <span class="emoji"
                    draggable={false}
                    data-type="emoji"
                    aria-label={/*@once*/et}
                    data-emoji={/*@once*/et}
                    title={/*@once*/format_emoji_shortcode(et, !e.s || !tone)}
                    data-search={/*@once*/e.b || (e.t ? e.t.concat(e.a) : e.a).join(' ')}
                >
                    <svg aria-role="img" aria-labelledby="e">
                        <desc id="e">{/*@once*/et}</desc>
                        <use href={/*@once*/`/static/emoji/${CATEGORIES[e.c]}.svg#${et}`} />
                    </svg>
                </span>
            );
        });
    });

    // simple event delegation to avoid adding listeners on every single emoji
    // the DOM here is incredibly shallow, so the number of iterations is likely usually less than 2
    let find_emoji = (t: HTMLElement, cb: (emoji: string | null, emote: Snowflake | null, element: HTMLElement) => void) => {
        while(t && t != ref.current) {
            let a = t.dataset['emoji'];
            if(a) { return cb(a, null, t); }
            if(a = t.dataset['emote']) { return cb(null, a, t); }
            t = t.parentElement!;
        }
    };

    let on_click = (e: MouseEvent) => find_emoji(e.target as HTMLElement, (emoji, emote) => props.onPick(emoji, emote));

    // // lazily fill in the titles on hover
    // let on_hover = (e: Event) => find_emoji(e.target as HTMLElement, (e, h) => {
    //     if(!h.title) {
    //         h.title = format_emoji_shortcode(e) || '';
    //     }
    // });

    let ref = createRef<HTMLDivElement>();

    // whenever the category changes, reset scroll to top
    createRenderEffect(() => {
        props.c, props.search;
        ref.current?.scrollTo({ top: 0, behavior: 'instant' as any });
    });

    let is_filtered = false;

    let [none, setNone] = createSignal(false);

    createRenderEffect(() => {
        // ensure filter is applied whenever the emoji list refreshes, too.
        // by using emojis() rather than props.tone or such, this forces emojis() higher up in the graph
        // and gives it a chance to be inserted into the DOM *first*
        emojis();

        let children = ref.current?.children, search = props.search;

        // if there are children to filter and a search to be done or it needs to be cleared
        if(children && (search || is_filtered)) {
            let any = false;

            for(let i = 0; i < children.length; i++) {
                let child = children[i] as HTMLElement,
                    matches = child.dataset?.['search']?.includes(search);

                if(matches != null) {
                    let new_display = matches ? '' : 'none';

                    if(child.style.display != new_display) {
                        child.style.display = new_display;
                    }

                    any ||= matches;
                }
            }

            is_filtered = !!search;
            setNone(!any);
        }
    });

    return (
        // NOTE: This must use on:click for custom delegation
        <div ref={ref} use:cleanedEvent={[['click', on_click]]} class="ln-emoji-picker__listing ln-scroll-y ln-scroll-fixed" data-search={props.search}>
            {emojis()}

            <Show when={none()}>
                There are no emojis matching your search!
            </Show>
        </div>
    );
}