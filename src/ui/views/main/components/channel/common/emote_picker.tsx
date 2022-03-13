import { createSignal } from "solid-js";

import { VectorIcon } from "ui/components/common/icon";
import { AnchoredModal } from "ui/components/modal/anchored";
import { useMainClick } from "ui/hooks/useMain";

import { SmileyHalfIcon } from "lantern-icons";

import "./emote_picker.scss";
export function EmotePicker() {
    let [show, setShow] = createSignal(false);

    let main_click_props = useMainClick({
        active: show,
        onMainClick: () => setShow(false),
        onClick: (e: MouseEvent) => {
            setShow(v => !v); // toggle
            e.stopPropagation();
        }
    });

    return (
        <div title="Emoji" className="ln-msg-box__emoji" classList={{ 'active': show() }} {...main_click_props}>
            <VectorIcon src={SmileyHalfIcon} />

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