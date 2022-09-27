import { createSignal } from "solid-js"
import { usePrefs } from "state/contexts/prefs";
import { emoji_url } from "config/urls";

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

    return () => use_system() ? <span class="emoji" classList={{ 'large': large() }} textContent={value()} /> : (
        <img loading="lazy" class="emoji" classList={{ 'large': large() }}
            alt={value()} aria-label={value()}
            draggable={false} data-type="emoji"
            src={emoji_url(value())}
            onError={() => setErrored(true)} />
    );
}