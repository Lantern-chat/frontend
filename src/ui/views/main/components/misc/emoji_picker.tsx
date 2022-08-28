import { ALIASES_REV, CATEGORIES, decode_emojis, EMOJIS, EMOJIS_MAP, emoji_with_skin_tone, format_emoji_shortcode, IEmoji, SKIN_TONE_MODIFIER } from "lib/emoji";
import { batch, createMemo, createRenderEffect, createSelector, createSignal, For, onMount, Show } from "solid-js";
import { EmojiLite } from "ui/components/common/emoji_lite";
import { createRef } from "ui/hooks/createRef";
import throttle from 'lodash/throttle';

export interface IEmojiPickerProps {
    onPick(emoji: string): void;
    tone?: SKIN_TONE_MODIFIER;
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

    let [category, setCategory] = createSignal(0);
    let [search, setSearch] = createSignal("");

    let selected = createSelector(category);

    let input: HTMLInputElement | undefined;

    let on_input = throttle(() => setSearch(input!.value), 500, { leading: false, trailing: true });

    onMount(() => {
        input?.focus();
    });

    let on_category = (idx: number) => batch(() => {
        setCategory(idx);
        setSearch('');
    });

    return (
        <div class="ln-emoji-picker">
            <div class="ln-emoji-picker__search">
                <input ref={input} type="text" placeholder="Search" value={search()} onInput={on_input} />

            </div>
            <div class="ln-emoji-picker__picker">
                <div class="ln-emoji-picker__categories">
                    {FORMATTED_CATEGORIES.map(({ p, e }, idx) => {
                        return (
                            <div title={p} onClick={() => on_category(idx)} classList={{
                                'selected': selected(idx),
                            }}>
                                <EmojiLite value={emoji_with_skin_tone(e[0].e, props.tone)} />
                            </div>
                        )
                    })}
                </div>
                <PickerCategory {...props} c={category()} all={!!search()} search={search()} />
            </div>
        </div>
    );
}

function PickerCategory(props: IEmojiPickerProps & { c: number, all?: boolean, search: string }) {
    let emojis = createMemo(() => {
        let e = props.all ? EMOJIS : FORMATTED_CATEGORIES[props.c].e;

        return e.map(e => {
            let et = emoji_with_skin_tone(e.e, props.tone);

            return (
                <span class="emoji"
                    draggable={false}
                    data-type="emoji"
                    aria-label={/*@once*/et}
                    data-emoji={/*@once*/et}
                    title={format_emoji_shortcode(et, !e.s || !props.tone)}
                    data-shortcodes={e.a.join(' ')}
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
    let find_emoji = (t: HTMLElement, cb: (emoji: string, element: HTMLElement) => void) => {
        while(t && t != ref.current) {
            let a = t.getAttribute('data-emoji');
            if(a) {
                return cb(a, t);
            }
            t = t.parentElement!;
        }
    };

    let on_click = (e: MouseEvent) => find_emoji(e.target as HTMLElement, props.onPick);

    // // lazily fill in the titles on hover
    // let on_hover = (e: Event) => find_emoji(e.target as HTMLElement, (e, h) => {
    //     if(!h.title) {
    //         h.title = format_emoji_shortcode(e) || '';
    //     }
    // });

    let ref = createRef<HTMLDivElement>();

    // whenever the category changes, reset scroll to top
    createRenderEffect(() => {
        props.c;
        ref.current?.scrollTo({ top: 0, behavior: 'instant' as any });
    });

    let show_all = true;

    let [none, setNone] = createSignal(false);

    createRenderEffect(() => {
        let search = props.search.trim().toLowerCase();

        if(search || !show_all) {
            let search_regex = new RegExp(search), any = false;

            ref.current?.childNodes.forEach((node: HTMLElement) => {
                if(node.dataset) {
                    let matches = search_regex.test(node.dataset['shortcodes']!);
                    node.style.display = matches ? '' : 'none';
                    any ||= matches;
                }
            });

            show_all = !search;
            setNone(!any);
        }
    });

    return (
        <div ref={ref} on:click={on_click} class="ln-emoji-picker__listing ln-scroll-y" data-search={props.search}>
            {emojis()}

            <Show when={none()}>
                There are no emojis matching your search!
            </Show>
        </div>
    );
}