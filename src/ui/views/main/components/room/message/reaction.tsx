import { PutReaction, DeleteOwnReaction } from "client-sdk/src/api/commands";
import { Icons } from "lantern-icons";
import { For } from "solid-js";
import { CLIENT } from "state/global";
import { Emote, Message, Snowflake } from "state/models";
import { Emoji, CustomEmote } from "ui/components/common/emoji";
import { VectorIcon } from "ui/components/common/icon";
import { AnchoredModal } from "ui/components/modal/anchored";
import { createSimpleToggleOnClick, MainContext } from "ui/hooks/useMain";
import { EmojiPicker } from "../../misc/emoji_picker";

export interface IReactionsProps {
    msg: Message,
}

import "./reaction.scss";
export function Reactions(props: IReactionsProps) {
    let [show, main_click_props, setShow] = createSimpleToggleOnClick();

    let on_pick = (emoji: string | null, emote: Snowflake | null) => {
        setShow(false);
        CLIENT.execute(PutReaction({ room_id: props.msg.room_id, msg_id: props.msg.id, e: { emoji: emoji!, emote: emote! } }));
    };

    let on_click = (e: MouseEvent) => {
        let emote: string | undefined,
            emoji: string | undefined,
            t = e.target as HTMLElement | null,
            d: string | undefined;

        while(t && t != e.currentTarget) {
            d = t.dataset["emote"];
            if(d) { emote = d; break; }
            d = t.dataset["emoji"];
            if(d) { emoji = d; break; }

            t = t.parentElement;
        }

        if(emote || emoji) {
            let msg = props.msg, args = { room_id: msg.room_id, msg_id: msg.id, e: emoji ? { emoji } : { emote: emote! } };
            CLIENT.execute(t?.classList.contains("me") ? DeleteOwnReaction(args) : PutReaction(args));
        }
    };

    return (
        <div class="ln-reaction__wrapper" onClick={on_click}>
            <For each={props.msg.reactions}>
                {(reaction: any) => (
                    <span class="ln-reaction" classList={{ "me": reaction.me }}
                        data-emote={reaction.emote} data-emoji={reaction.emoji}
                    >
                        {/* emote is immutable here, so a regular branch is fine */}
                        {/*@once*/ reaction.emote ? <CustomEmote id={reaction.emote} name="" /> : <Emoji value={reaction.emoji} />}
                        <span class="ln-reaction__count ui-text" textContent={reaction.count} />
                    </span>
                )}
            </For>

            <span class="ln-reaction ln-reaction--add" classList={{ "active": show() }} {...main_click_props}>
                <VectorIcon id={Icons.SmileyHalf} />

                <AnchoredModal show={show()} eat={["onClick"]}>
                    <EmojiPicker onPick={on_pick} />
                </AnchoredModal>
            </span>
        </div>
    )
}

