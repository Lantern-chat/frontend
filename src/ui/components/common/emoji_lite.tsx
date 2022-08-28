import { createSignal, Show } from "solid-js"
import { usePrefs } from "state/contexts/prefs";
import { normalize } from "lib/emoji_lite";

import type { IEmojiProps } from "./emoji";

export type IEmojiLiteProps = Pick<IEmojiProps, 'value' | 'large'>;

// This is a more lightweight version of the emoji component
// that does not require any of the emoji database be present.
// As such, it is more useful for things like the login page.
import "./emoji.scss";
export function EmojiLite(props: IEmojiLiteProps) {
    const prefs = usePrefs();

    let value = () => props.value;

    let [errored, setErrored] = createSignal(false);

    // NOTE: This assumes a valid unicode emoji
    let use_system = () => errored() || prefs.UsePlatformEmojis();

    let large = () => props.large && !prefs.CompactView();

    return (
        <Show when={!use_system()} fallback={
            <span class="emoji" classList={{ 'large': large() }} textContent={value()} />
        }>
            <img class="emoji" classList={{ 'large': large() }}
                alt={value()} aria-label={value()}
                draggable={false} data-type="emoji"
                src={`/static/emoji/individual/${normalize(value())}.svg`}
                onError={() => setErrored(true)} />
        </Show>
    );
}