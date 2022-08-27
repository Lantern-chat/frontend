import { createEffect, createMemo, createSignal, Show } from "solid-js"
import { createRef, Ref } from "ui/hooks/createRef";
import { Branch } from "./../flow";
import { usePrefs } from "state/contexts/prefs";
import { EMOJI_RE, normalize } from "lib/emoji";

export interface IEmojiProps {
    value: string,

    /// flag for if the emote is in a user-interface string
    ui?: boolean,

    large?: boolean,
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

    return (
        <Show fallback={<span class="emoji" classList={{ 'large': large() }} textContent={value()} ref={ref} />} when={!use_system()}>
            <img class="emoji" classList={{ 'large': large() }} alt={value()} aria-label={value()}
                draggable={false} data-type="emoji"
                src={`https://twemoji.maxcdn.com/v/14.0.2/svg/${normalize(value())}.svg`}
                onError={() => setErrored(true)} ref={ref as any} />
        </Show>
    );
}