import { createSignal, Show } from "solid-js"
import { usePrefs } from "state/contexts/prefs";
import { emoji_url } from "config/urls";
import { LAZY_ATTR } from "lib/user_agent";

import type { IEmojiProps } from "./emoji";

export type IEmojiLiteProps = Pick<IEmojiProps, "value" | "large">;

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
            <span class="emoji" classList={{ "large": large() }} textContent={value()} />
        }>
            <img class="emoji" classList={{ "large": large() }}
                loading={LAZY_ATTR}
                alt={value()} aria-label={value()}
                draggable={false} data-type="emoji"
                src={emoji_url(value())}
                on:error={() => setErrored(true)} />
        </Show>
    );
}