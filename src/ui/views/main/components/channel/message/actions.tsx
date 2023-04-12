import { Message, Snowflake } from "state/models";
import { PutReaction } from "client-sdk/src/api/commands";
import { Icons } from "lantern-icons";
import { useContext } from "solid-js";
import { CLIENT } from "state/global";
import { VectorIcon } from "ui/components/common/icon";
import { AnchoredModal } from "ui/components/modal/anchored";
import { MainContext, createSimpleToggleOnClick } from "ui/hooks/useMain";
import { EmojiPicker } from "../../misc/emoji_picker";

function do_pick(msg: Message, emoji: string | null, emote: Snowflake | null) {
    CLIENT.execute(PutReaction({ room_id: msg.room_id, msg_id: msg.id, e: { emoji: emoji!, emote: emote! } }));
}

import "./actions.scss";
export function ActionWidget(props: { msg: Message }) {
    let main = useContext(MainContext);

    let [show, { "onClick": on_react_click, ...main_click_props }, setShow] = createSimpleToggleOnClick(undefined, main);

    let on_click = (e: MouseEvent) => {
        let t = e.target as HTMLElement | null;

        dispatch: while(t && t != e.currentTarget) {
            switch(t.dataset["action"]) {
                case "react": {
                    on_react_click!(e);
                    break dispatch;
                }
            }

            t = t.parentElement;
        }
    };

    return (
        <div onClick={on_click} class="ln-action-widget" {...main_click_props}>
            <span data-action="react">
                <VectorIcon id={Icons.SmileyHalf} />

                <AnchoredModal show={show()} eat={["onClick"]}>
                    <EmojiPicker onPick={(emoji, emote) => { do_pick(props.msg, emoji, emote); setShow(false); }} />
                </AnchoredModal>
            </span>
        </div>
    )
}