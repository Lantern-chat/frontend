import { createEffect, createMemo, createSignal, Show } from "solid-js"
import { createRef, Ref } from "ui/hooks/createRef";
import { usePrefs } from "state/contexts/prefs";
import { ALIASES_REV, EMOJI_RE, emoji_with_skin_tone, SKIN_TONE_MODIFIER, format_emoji_shortcode, decode_emojis } from "lib/emoji";
import type { Snowflake } from "state/models";
import { emote_url, emoji_url } from "config/urls";

export interface IEmojiProps {
    value: string,
    named?: boolean,

    /// flag for if the emote is in a user-interface string
    ui?: boolean,

    large?: boolean,

    noTitle?: boolean,

    tone?: SKIN_TONE_MODIFIER;
}

import "./emoji.scss";
export function Emoji(props: IEmojiProps) {
    const prefs = usePrefs();

    let ref: HTMLElement | ((el: HTMLElement) => void) | undefined;

    let value = createMemo(() => {
        let e = props.value;

        if(props.named) {
            decode_emojis();
            e = ALIASES_REV.get(e)!;
        }

        return emoji_with_skin_tone(e, props.tone);
    });

    // zero-cost easter egg
    if(!props.ui && value() == '🍪') {
        ref = createRef();
        createEffect(() => {
            let c = 0; (ref as Ref<HTMLElement>).current?.addEventListener('click', () => {
                if(++c == 5) { window.open('https://orteil.dashnet.org/cookieclicker/'); c = 0; }
            });
        });
    }

    let [errored, setErrored] = createSignal(false);

    let use_system = () => errored() || !EMOJI_RE.test(value()) || prefs.UsePlatformEmojis();

    let large = () => props.large && !prefs.CompactView();

    let title = () => {
        if(!props.noTitle) {
            return format_emoji_shortcode(value());
        }
        return;
    };

    return () => use_system() ? (
        <span class="emoji" classList={{ 'large': large() }} textContent={value()} ref={ref} title={title()} />
    ) : (
        <img loading="lazy" class="emoji" classList={{ 'large': large() }}
            aria-label={value()} draggable={false} data-type="emoji"
            src={emoji_url(value())}
            on:load={(e) => { (e.target as HTMLImageElement).alt = value(); }}
            on:error={() => setErrored(true)}
            title={title()} ref={ref as any} />
    );
}

export function CustomEmote(props: { id: Snowflake, large?: boolean, name: string }) {
    const prefs = usePrefs();

    let large = () => props.large && !prefs.CompactView();

    return (
        <img loading="lazy" class="emoji" classList={{ 'large': large() }}
            draggable={false} data-type="emoji" title={props.name}
            src={emote_url("emote", props.id, prefs.LowBandwidthMode())}
            alt={`<:${props.name}:${props.id}>`}
        />
    );
}