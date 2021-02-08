import React, { useLayoutEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";

import { RootState } from "ui/views/main/reducers";
import TextareaAutosize from 'react-textarea-autosize';
import { Glyphicon } from "ui/components/common/glyphicon";

import Smiley from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-901-slightly-smiling.svg";
import SmileyHalf from "icons/glyphicons-pro/glyphicons-halflings-2-2/svg/individual-svg/glyphicons-halflings-243-slightly-smiling.svg";
import Send from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-461-send.svg";

import "./box.scss";
export const MessageBox = React.memo(() => {
    let ref = useRef<HTMLTextAreaElement>(null);
    let [value, setValue] = useState("");

    let dispatch = useDispatch();

    let on_keydown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if(!e.shiftKey && e.key == 'Enter') {
            dispatch({ type: 'send', value });
            setValue("");
        }
    };

    let on_change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        // the "Enter" key newline is still present after keydown, so trim that
        // also prevents leading newlines
        setValue(e.currentTarget.value.replace(/^\n+/, ''));
    };

    let on_click = (_e: React.MouseEvent<HTMLDivElement>) => {
        if(ref.current) { ref.current.focus(); }
    };

    return (
        <div className="ln-msg-box" onClick={on_click}>
            <div className="ln-msg-box__emoji">
                <Glyphicon src={SmileyHalf} />
            </div>
            <div className="ln-msg-box__box">
                <TextareaAutosize
                    cacheMeasurements={true}
                    ref={ref as any}
                    placeholder="Message..."
                    rows={1} maxRows={20}
                    value={value} onKeyDown={on_keydown} onChange={on_change} />
            </div>
            <div className="ln-msg-box__send">
                <Glyphicon src={Send} />
            </div>
        </div>
    );
});