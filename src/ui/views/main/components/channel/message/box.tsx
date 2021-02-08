import React, { useLayoutEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import TextareaAutosize from 'react-textarea-autosize';

import { IMessageState } from "ui/views/main/reducers/messages";
import { RootState } from "ui/views/main/reducers";

import { Glyphicon } from "ui/components/common/glyphicon";

import Smiley from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-901-slightly-smiling.svg";
import SmileyHalf from "icons/glyphicons-pro/glyphicons-halflings-2-2/svg/individual-svg/glyphicons-halflings-243-slightly-smiling.svg";
import Send from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-461-send.svg";

function countLines(str: string): number {
    return (str.match(/\n/g) || '').length;
}

import "./box.scss";
export const MessageBox = React.memo(() => {
    let dispatch = useDispatch();

    let ref = useRef<HTMLTextAreaElement>(null);
    let [value, setValue] = useState("");
    let [isEditing, setIsEditing] = useState(false);

    let { messages, current_edit }: IMessageState = useSelector((state: RootState) => state.messages);

    if(current_edit != null && isEditing === false) {
        setValue(messages.find((msg) => msg.id == current_edit)!.msg);
        setIsEditing(true);
    }

    let on_keydown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if(!e.shiftKey && e.key === 'Enter') {
            dispatch({ type: current_edit != null ? 'MESSAGE_SEND_EDIT' : 'MESSAGE_SEND', payload: value.trim() });
            setValue("");
            setIsEditing(false);
        } else if(['ArrowUp', 'ArrowDown'].includes(e.key)) {

            let total_lines = countLines(value);
            let current_line = countLines(value.slice(0, ref.current!.selectionStart));

            console.log("Total lines: ", total_lines);
            console.log("Current line: ", current_line);

            if(e.key === 'ArrowUp' && current_line === 0) {
                dispatch({ type: 'MESSAGE_EDIT_PREV' });
            } else if(e.key === 'ArrowDown' && current_line === total_lines) {
                dispatch({ type: 'MESSAGE_EDIT_NEXT' });
            } else {
                return;
            }

            setIsEditing(false);
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