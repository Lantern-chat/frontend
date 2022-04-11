import { createSignal } from "solid-js";

import { VectorIcon } from "ui/components/common/icon";
import { AnchoredModal } from "ui/components/modal/anchored";
import { createSimpleToggleOnClick, useMainClick } from "ui/hooks/useMain";

import { Icons } from "lantern-icons";

import "./emote_picker.scss";
export function EmotePicker() {
    let [show, main_click_props, setShow] = createSimpleToggleOnClick();

    return (
        <div title="Emoji" className="ln-msg-box__emoji" classList={{ 'active': show() }} {...main_click_props}>
            <VectorIcon id={Icons.SmileyHalf} />

            <AnchoredModal show={show()} eat={["onClick"]}>
                <EmotePickerModal />
            </AnchoredModal>
        </div>
    );
}

function EmotePickerModal() {
    return (
        <div className="ln-emoji-picker">
            Emote Picker
        </div>
    )
}