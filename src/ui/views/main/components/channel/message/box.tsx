import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createStructuredSelector } from "reselect";

import TextareaAutosize from 'react-textarea-autosize';

//import { IMessageState } from "ui/views/main/reducers/messages";
import { RootState } from "models/main";

import { Glyphicon } from "ui/components/common/glyphicon";

//import Smiley from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-901-slightly-smiling.svg";
import SmileyHalf from "icons/glyphicons-pro/glyphicons-halflings-2-2/svg/individual-svg/glyphicons-halflings-243-slightly-smiling.svg";
import Send from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-461-send.svg";
import Plus from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-371-plus.svg";

import { editMessageNext, editMessagePrev, sendMessage, sendMessageEdit, editMessageDiscard } from "models/main/actions/msg";

// TODO: Move elsewhere
function countLines(str: string): number {
    return (str.match(/\n/g) || '').length;
}

const msg_selector = createStructuredSelector({
    msg: (state: RootState) => state.messages,
    use_mobile_view: (state: RootState) => state.window.use_mobile_view,
});

import "./box.scss";
export const MessageBox = React.memo(() => {
    let dispatch = useDispatch();
    let { msg: { messages, current_edit }, use_mobile_view } = useSelector(msg_selector);

    let ref = useRef<HTMLTextAreaElement>(null);
    let keyRef = useRef<HTMLSpanElement>(null);

    interface MsgBoxState {
        value: string,
        backup: string | null,
        isEditing: boolean,
    }

    let [focused, setFocus] = useState(false);
    let [state, setState] = useState<MsgBoxState>({
        value: "",
        backup: null,
        isEditing: false,
    });

    if(state.isEditing === true && current_edit == null) { // in edit-mode but no message is selected for edit
        setState({ ...state, isEditing: false, value: "" });

    } else if(state.isEditing === false && state.backup != null) { // not editing but there is a backup value
        setState({ ...state, value: state.backup, backup: null });

    } else if(state.isEditing === false && current_edit != null) { // not editing but there is a message that needs editing
        // backup value only if there isn't already a backup (like if the message being edited changed)
        setState({
            backup: state.backup || state.value,
            value: messages.find((msg) => msg.id == current_edit)!.msg,
            isEditing: true,
        });
    }

    let do_send = () => {
        dispatch(state.isEditing ? sendMessageEdit(state.value) : sendMessage(state.value));
        setState({ ...state, value: "" });
    };

    let open_upload_click = (e: React.MouseEvent<HTMLDivElement>) => {
        alert("Upload is not yet implemented!");
    };

    let on_send_click = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation(); // prevent refocus if not focused

        if(state.value.length > 0) {
            do_send();
        }

        if(focused) {
            ref.current!.focus(); // refocus just in-case, since on Safari it blurs automatically
        }
    };

    let on_keydown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        keyRef.current!.innerText = (e.ctrlKey ? 'Ctrl+' : '') + (e.altKey ? 'Alt+' : '') + (e.shiftKey ? 'Shift+' : '') + (e.key === ' ' ? 'Spacebar' : e.key);

        switch(e.key) {
            case 'Enter': {
                if(use_mobile_view || e.shiftKey || state.value.length === 0) return;

                let cursor = ref.current!.selectionStart;

                // check if the cursor is inside a code block, in which case allow plain newlines
                let prev = { index: 0 }, delim, re = /`{3}/g, inside = false;
                for(let idx = 0; delim = re.exec(state.value); idx++) {
                    if(prev.index <= cursor && cursor > delim.index) {
                        inside = !inside;
                    }
                    prev = delim;
                }
                if(inside) return;

                e.preventDefault(); // don't add the newline

                do_send();

                break;
            }
            case 'ArrowUp':
            case 'ArrowDown': {
                let total_lines = countLines(state.value);
                let current_line = countLines(state.value.slice(0, ref.current!.selectionStart));

                if(e.key === 'ArrowUp' && current_line === 0) {
                    dispatch(editMessagePrev());
                } else if(e.key === 'ArrowDown' && current_line === total_lines) {
                    dispatch(editMessageNext());
                } else {
                    return;
                }

                setState({ ...state, isEditing: false }); // trigger reload
                break;
            }
            case 'Escape':
            case 'Esc': {
                if(state.isEditing) { dispatch(editMessageDiscard()); }
                break;
            }
        }
    };

    let on_change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        // the "Enter" key newline is still present after keydown, so trim that
        // also prevents leading newlines
        setState({ ...state, value: e.currentTarget.value.replace(/^\n+/, '') });
    };

    let on_click_focus = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        ref.current!.focus();
    };

    let is_empty = state.value.length == 0;

    // https://github.com/buildo/react-autosize-textarea/issues/52
    return (
        <div className="ln-msg-box" onClick={on_click_focus}>
            <div className="ln-msg-box__emoji">
                <Glyphicon src={SmileyHalf} />
            </div>
            <div className="ln-msg-box__box">
                <TextareaAutosize
                    onBlur={() => setTimeout(() => setFocus(false), 0)} // don't run on same frame?
                    onFocus={() => setFocus(true)}
                    cacheMeasurements={true}
                    ref={ref as any}
                    placeholder="Message..."
                    rows={1} maxRows={use_mobile_view ? 5 : 20}
                    value={state.value} onKeyDown={on_keydown} onChange={on_change} />
            </div>
            <div className="ln-msg-box__debug">
                <span ref={keyRef}></span>
            </div>
            <div className="ln-msg-box__send" onClick={is_empty ? open_upload_click : on_send_click}>
                <Glyphicon src={is_empty ? Plus : Send} />
            </div>
        </div>
    );
});