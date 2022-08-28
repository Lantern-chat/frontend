import { createEffect, createMemo, createSignal, Show } from "solid-js"
import { createRef, Ref } from "ui/hooks/createRef";
import { usePrefs } from "state/contexts/prefs";
import { EMOJIS_MAP, ALIASES_REV, decode_emojis, EMOJI_RE } from "lib/emoji";
import { normalize } from "lib/emoji_lite";

export interface IEmojiProps {
    value: string,
    named?: boolean,

    /// flag for if the emote is in a user-interface string
    ui?: boolean,

    large?: boolean,

    noTitle?: boolean,

    tone?: 0 | 1 | 2 | 3 | 4 | 5;
}

let skin_tones = [
    '',
    "🏻",
    "🏼",
    "🏽",
    "🏾",
    "🏿",
];

let ends_with_skin_tone = new RegExp(`(${skin_tones.slice(1).join('|')})$`);

import "./emoji.scss";
export function Emoji(props: IEmojiProps) {
    const prefs = usePrefs();

    let ref: HTMLElement | ((el: HTMLElement) => void) | undefined;

    let raw_value = () => {
        let e = props.value;

        if(props.named) {
            e = ALIASES_REV.get(e)!;
        }

        return e;
    };

    // TODO: Map :named: emotes to emoji values
    let value = createMemo(() => {
        let e = raw_value();

        if(props.tone) {
            let m = EMOJIS_MAP.get(e);
            if(m?.s) {
                e += skin_tones[props.tone];
            }
        }

        return e;
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
            decode_emojis();

            let m, v = value(), s = ':';
            if(m = ends_with_skin_tone.exec(v)) {
                // slice off tone modifier to get raw emoji for alias lookup
                v = v.slice(0, v.length - m[1].length);

                // set suffix
                s = '::skin-tone-' + skin_tones.indexOf(m[1]).toString() + s;
            }

            let e = EMOJIS_MAP.get(v);
            if(e?.a.length) {
                return ':' + e.a[0] + s;
            }
        }
        return;
    };

    return (
        <Show when={!use_system()} fallback={
            <span class="emoji" classList={{ 'large': large() }} textContent={value()} ref={ref} title={title()} />
        }>
            <img class="emoji" classList={{ 'large': large() }}
                alt={loaded() ? value() : undefined}
                aria-label={value()} draggable={false} data-type="emoji"
                src={`/static/emoji/individual/${normalize(value())}.svg`}
                title={title()}
                onLoad={() => setLoaded(true)}
                onError={() => setErrored(true)} ref={ref as any} />
        </Show>
    );
}