import React, { useState } from "react";
import { Glyphicon } from "ui/components/common/glyphicon";

import SmileyHalf from "icons/glyphicons-pro/glyphicons-halflings-2-3/svg/individual-svg/glyphicons-halflings-243-slightly-smiling.svg";
import { AnchoredModal } from "ui/components/anchored_modal";
import { useMainClick } from "ui/hooks/useMainClick";

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

    let className = "ln-msg-box__emoji";
    if(show) {
        className += " active";
    }

    return (
        <div className={className} {...main_click_props} title="Emoji">
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
