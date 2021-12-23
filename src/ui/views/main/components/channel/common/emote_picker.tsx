import classNames from "classnames";
import React, { useState } from "react";
import { Glyphicon } from "ui/components/common/glyphicon";
import { AnchoredModal } from "ui/components/modal/anchored_modal";
import { useMainClick } from "ui/hooks/useMainClick";

import SmileyHalf from "icons/glyphicons-pro/glyphicons-halflings-2-3/svg/individual-svg/glyphicons-halflings-243-slightly-smiling.svg";

import "./emote_picker.scss";
export const EmotePicker = React.memo(() => {
    let [show, setShow] = useState(false);

    let main_click_props = useMainClick({
        active: show,
        onMainClick: () => setShow(false),
        onClick: (e: React.MouseEvent) => {
            setShow(!show);
            e.stopPropagation();
        }
    }, [show]);

    let className = classNames("ln-msg-box__emoji", { active: show });

    return (
        <div title="Emoji" className={className} {...main_click_props}>
            <Glyphicon src={SmileyHalf} />

            <AnchoredModal show={show} eat={["onClick"]}>
                <EmotePickerModal />
            </AnchoredModal>
        </div>
    );
});

const EmotePickerModal = React.memo(() => {
    return (
        <div className="ln-emoji-picker">
            Emote Picker
        </div>
    )
});

if(__DEV__) {
    EmotePicker.displayName = "EmotePicker";
    EmotePickerModal.displayName = "EmotePickerModal";
}