import { createEffect, createMemo, createSignal, Show } from "solid-js"
import { createRef, Ref } from "ui/hooks/createRef";
import { usePrefs } from "state/contexts/prefs";
import { ALIASES_REV, EMOJI_RE, emoji_with_skin_tone, SKIN_TONE_MODIFIER, format_emoji_shortcode, decode_emojis } from "lib/emoji";
import { normalize } from "lib/emoji_lite";

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
    let [loaded, setLoaded] = createSignal(false);

    let use_system = () => errored() || !EMOJI_RE.test(value()) || prefs.UsePlatformEmojis();

    let large = () => props.large && !prefs.CompactView();

    let title = () => {
        if(!props.noTitle) {
            return format_emoji_shortcode(value());
        }
        return;
    };

    return (
        <Show when={!use_system()} fallback={
            <span class="emoji" classList={{ 'large': large() }} textContent={value()} ref={ref} title={title()} />
        }>
            <img loading="lazy" class="emoji" classList={{ 'large': large() }}
                alt={loaded() ? value() : undefined}
                aria-label={value()} draggable={false} data-type="emoji"
                src={`/static/emoji/individual/${normalize(value())}.svg`}
                title={title()}
                onLoad={() => setLoaded(true)}
                onError={() => setErrored(true)} ref={ref as any} />
        </Show>
    );
}