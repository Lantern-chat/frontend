import { UserPreferenceFlags } from "state/models";
import { createEffect } from "solid-js"
import { useRootSelector } from "state/root";
import { selectPrefsFlag } from "state/selectors/prefs";
import { createRef, Ref } from "ui/hooks/createRef";
import { Branch } from "./../flow";

export interface IEmojiProps {
    value: string,
    ui?: boolean,
}

export function Emoji(props: IEmojiProps) {
    let ref: HTMLSpanElement | ((el: HTMLElement) => void) | undefined;

    // zero-cost easter egg
    if(!props.ui && props.value == '🍪') {
        ref = createRef();
        createEffect(() => {
            let c = 0; (ref as Ref<HTMLElement>).current?.addEventListener('click', () => {
                if(++c == 5) { window.open('https://orteil.dashnet.org/cookieclicker/'); }
            });
        });
    }

    let use_system = useRootSelector(selectPrefsFlag(UserPreferenceFlags.UsePlatformEmojis));

    // TODO: Resolve emoji to twemoji file
    return (
        <Branch>
            <Branch.If when={use_system() || true}>
                <span class="emoji" textContent={props.value} ref={ref} />
            </Branch.If>
            <Branch.Else>
                Twemoji
            </Branch.Else>
        </Branch>
    );
}