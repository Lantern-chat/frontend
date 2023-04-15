import { createEffect, createMemo, createSignal, onCleanup } from "solid-js"
import { ShowBool } from "../flow";
import { usePrefs } from "state/contexts/prefs";
import { ALIASES_REV, EMOJI_RE, emoji_with_skin_tone, SKIN_TONE_MODIFIER, format_emoji_shortcode, decode_emojis } from "lib/emoji";
import type { Snowflake } from "state/models";
import { emote_url, emoji_url } from "config/urls";
import { LAZY_ATTR } from "lib/user_agent";

import { cleanedEvent } from "ui/directives/bugs";
false && cleanedEvent;

export interface IEmojiProps {
    value: string,
    named?: boolean,

    /// flag for if the emote is in a user-interface string
    ui?: boolean,

    large?: boolean,

    noTitle?: boolean,

    tone?: SKIN_TONE_MODIFIER;
}

const EGGS: Record<string, string> = {
    "🍪": "https://orteil.dashnet.org/cookieclicker/",
};

import "./emoji.scss";
export function Emoji(props: IEmojiProps) {
    const prefs = usePrefs();

    let value = createMemo(() => {
        let e = props.value;

        if(props.named) {
            decode_emojis();
            e = ALIASES_REV.get(e)!;
        }

        return emoji_with_skin_tone(e, props.tone);
    });

    let ref: HTMLElement | undefined, egg: string | undefined;

    // zero-cost easter egg
    if(!props.ui && (egg = EGGS[value()])) {
        createEffect(() => {
            let c = 0, listener = (e: MouseEvent) => {
                if(++c == 5) { window.open(egg); c = 0; }
                ref!.style.userSelect = c > 0 ? 'none' : 'auto';
            };

            ref!.addEventListener("click", listener);
            onCleanup(() => ref!.removeEventListener("click", listener));
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

    return (
        <ShowBool when={!use_system()} fallback={
            <span class="emoji" classList={{ "large": large() }} textContent={value()} ref={ref} title={title()} />
        }>
            <img class="emoji" classList={{ "large": large() }}
                aria-label={value()} draggable={false} data-type="emoji"
                loading={LAZY_ATTR}
                src={emoji_url(value())}
                use:cleanedEvent={[
                    ["load", (e) => { (e.target as HTMLImageElement).alt = value(); }],
                    ["error", () => setErrored(true)]
                ]}
                title={title()} ref={ref as any} />
        </ShowBool>
    );
}

export function CustomEmote(props: { id: Snowflake, large?: boolean, name: string }) {
    const prefs = usePrefs();

    let large = () => props.large && !prefs.CompactView();

    return (
        <img class="emoji" classList={{ "large": large() }}
            loading={LAZY_ATTR}
            draggable={false} data-type="emoji" title={props.name}
            src={emote_url("emote", props.id, prefs.LowBandwidthMode())}
            alt={`<:${props.name}:${props.id}>`}
        />
    );
}