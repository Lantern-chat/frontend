import { EMOJI_RE } from "lib/emoji";
import { usePrefs } from "state/contexts/prefs";
import { normalize } from "lib/emoji_lite";

export interface UITextProps {
    text: string,
    class?: 'ui-text' | 'chat-text',
}

import "./emoji.scss";
export function UserText(props: UITextProps) {
    // avoid the context lookup if no emojis are used
    let real_prefs: ReturnType<typeof usePrefs> | undefined, prefs = () => {
        if(!real_prefs) {
            real_prefs = usePrefs();
        }
        return real_prefs;
    };

    return (
        <span class={/*@once*/props.class}>
            {split_user_text(props.text)
                .map(n => typeof n === 'string' ? n : (prefs().UsePlatformEmojis()
                    ? <span class="emoji" textContent={/*@once*/n.e} />
                    : <img class="emoji" alt={/*@once*/n.e} draggable={false}
                        data-type="emoji" aria-label={/*@once*/n.e}
                        src={/*@once*/`/static/emoji/individual/${normalize(n.e)}.svg`}
                    />))}
        </span>
    );
};

const EMOJI_REG: RegExp = new RegExp('(?:' + EMOJI_RE.source + ')', 'g');

window['split_user_text'] = split_user_text;

type ENode = string | { e: string };
function split_user_text(text: string): Array<ENode> {
    let m: null | RegExpExecArray, i = 0, n: ENode[] = [];
    while(m = EMOJI_REG.exec(text)) {
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