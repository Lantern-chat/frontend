import { EMOJI_RE, find_emoji, format_emoji_shortcode } from "lib/emoji";
import { usePrefs } from "state/contexts/prefs";
import { emoji_url } from "config/urls";
import { lazy } from "lib/util";

export interface UITextProps {
    text: string,
    class?: 'ui-text' | 'chat-text',
}

function on_hover(e: Event) {
    let el = e.currentTarget as HTMLElement, emoji = el.getAttribute('aria-label');
    if(emoji) { el.title = format_emoji_shortcode(emoji)!; }

    // remove self
    el.removeEventListener('mouseover', on_hover);
}

import "./emoji.scss";
export function UserText(props: UITextProps) {
    // avoid the context lookup if no emojis are used
    let prefs = lazy(() => usePrefs());

    let inner = () => split_user_text(props.text)
        .map(n => typeof n === 'string' ? n : (
            prefs().UsePlatformEmojis() ? (
                <span class="emoji" draggable={false}
                    data-type="emoji" aria-label={/*@once*/n.e}
                    textContent={/*@once*/n.e} on:mouseover={on_hover}
                />) : (
                <img class="emoji" alt={/*@once*/n.e} draggable={false}
                    data-type="emoji" aria-label={/*@once*/n.e}
                    src={/*@once*/emoji_url(n.e)} on:mouseover={on_hover}
                />
            )));

    return props.class ?
        (<span class={/*@once*/props.class}>{inner()}</span>)
        : <>{inner()}</>;
};

const EMOJI_REG: RegExp = new RegExp('(?:' + EMOJI_RE.source + ')', EMOJI_RE.flags + 'g');

window['split_user_text'] = split_user_text;

type ENode = string | { e: string };
function split_user_text(text: string): Array<ENode> {
    let m: null | RegExpExecArray, i = 0, n: ENode[] = [];
    while(m = find_emoji(text, EMOJI_REG)) {
        if(m.index != i) { n.push(text.slice(i, m.index)); }
        n.push({ e: m[0] });
        i = m.index + m[0].length;
    }

    if(i == 0) {
        return [text];
    }

    if(i < text.length) {
        n.push(text.slice(i));
    }

    return n;
}