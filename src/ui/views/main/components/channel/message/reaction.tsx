import { Icons } from "lantern-icons";
import { For, Show } from "solid-js";
import { Emote as IEmote, Message } from "state/models";
import { Emoji, Emote } from "ui/components/common/emoji";
import { VectorIcon } from "ui/components/common/icon";
import { AnchoredModal } from "ui/components/modal/anchored";
import { createSimpleToggleOnClick } from "ui/hooks/useMain";
import { EmojiPicker } from "../../misc/emoji_picker";

export interface IReactionsProps {
    msg: Message,
}

import "./reaction.scss";
export function Reactions(props: IReactionsProps) {
    let wrapper: HTMLDivElement | undefined;

    let [show, main_click_props, setShow] = createSimpleToggleOnClick();

    let on_pick = (e: string) => {
        setShow(false);
        //props.onPick(e, format_emoji_shortcode(e));
    };

    let on_click = (e: MouseEvent) => {
        let emote, emoji;

        let t = e.target as HTMLElement | null, d;
        while(t && t != wrapper) {
            d = t.dataset['emote'];
            if(d) {
                emote = d;
                break;
            }
            d = t.dataset['emoji'];
            if(d) {
                emoji = d;
                break;
            }

            t = t.parentElement;
        }

        console.log(emote, emoji);
    };

    return (
        <div class="ln-reaction__wrapper" ref={wrapper} onClick={on_click}>
            <For each={props.msg.reactions}>
                {(reaction: any) => {

                    return (
                        <span class="ln-reaction" classList={{ 'own': reaction.own }}
                            data-emote={reaction.emote} data-emoji={reaction.emoji}
                        >
                            <Show when={reaction.emote} fallback={
                                <Emoji value={reaction.emoji} />
                            }>
                                <Emote id={reaction.emote} />
                            </Show>

                            <span class="ln-reaction__count ui-text" textContent={reaction.count} />
                        </span>
                    )
                }}
            </For>

            <span class="ln-reaction ln-reaction--add" classList={{ 'active': show() }} {...main_click_props}>
                <VectorIcon id={Icons.SmileyHalf} />

                <AnchoredModal show={show()} eat={["onClick"]}>
                    <EmojiPicker onPick={on_pick} />
                </AnchoredModal>
            </span>
        </div>
    )
}