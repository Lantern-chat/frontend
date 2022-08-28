import { createEffect, createSignal, Show } from "solid-js"
import { createRef, Ref } from "ui/hooks/createRef";
import { usePrefs } from "state/contexts/prefs";
import { ALIASES, decode_emojis, EMOJI_RE } from "lib/emoji";
import { normalize } from "lib/emoji_lite";

export interface IEmojiProps {
    value: string,

    /// flag for if the emote is in a user-interface string
    ui?: boolean,

    large?: boolean,

    noTitle?: boolean,
}

import "./emoji.scss";
export function Emoji(props: IEmojiProps) {
    const prefs = usePrefs();

    let ref: HTMLElement | ((el: HTMLElement) => void) | undefined;

    // TODO: Map :named: emotes to emoji values
    let value = () => props.value;

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
            decode_emojis();
            let aliases = ALIASES.get(value());
            if(aliases && aliases.length) {
                return ':' + aliases[0] + ':';
            }
        }
        return;
    };

    return (
        <Show when={!use_system()} fallback={
            <span class="emoji" classList={{ 'large': large() }} textContent={value()} ref={ref} title={title()} />
        }>
            <img class="emoji" classList={{ 'large': large() }}
                alt={value()} aria-label={value()}
                draggable={false} data-type="emoji"
                src={`/static/emoji/individual/${normalize(value())}.svg`}
                title={title()}
                onError={() => setErrored(true)} ref={ref as any} />
        </Show>
    );
}