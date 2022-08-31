import { createSignal } from "solid-js";

import { VectorIcon } from "ui/components/common/icon";
import { AnchoredModal } from "ui/components/modal/anchored";
import { createSimpleToggleOnClick, useMainClick } from "ui/hooks/useMain";

import { Icons } from "lantern-icons";
import { EmojiPicker } from "../../misc/emoji_picker";

export interface IEmotePickerProps {
    onPick(e: string, shortcode: string | undefined): void;
}

import "./emote_picker.scss";
import { format_emoji_shortcode } from "lib/emoji";
export function EmotePicker(props: IEmotePickerProps) {
    let [show, main_click_props, setShow] = createSimpleToggleOnClick();

    let on_pick = (e: string) => {
        setShow(false);
        props.onPick(e, format_emoji_shortcode(e));
    };

    return (
        <div title="Emoji" class="ln-msg-box__emoji" classList={{ 'active': show() }} {...main_click_props}>
            <VectorIcon id={Icons.SmileyHalf} />

            <AnchoredModal show={show()} eat={["onClick"]}>
                <EmojiPicker onPick={on_pick} />
            </AnchoredModal>
        </div>
    );
}
