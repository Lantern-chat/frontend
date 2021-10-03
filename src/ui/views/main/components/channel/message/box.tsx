import React, { ChangeEventHandler, forwardRef, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector, createStructuredSelector } from "reselect";

import TextareaAutosize from 'react-textarea-autosize';

//import { IMessageState } from "ui/views/main/reducers/messages";
import { RootState } from "state/root";
import { Type } from "state/actions";
import { Snowflake } from "state/models";
import { sendMessage, startTyping } from "state/commands";
import { activeParty, activeRoom } from "state/selectors/active";

import { FileUploadModal } from "ui/views/main/modals/file_upload";
import { Hotkey, MainContext, parseHotkey, useMainHotkey } from "ui/hooks/useMainClick";

import { Glyphicon } from "ui/components/common/glyphicon";
import { EmotePicker } from "./emote_picker";

//import Smiley from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-901-slightly-smiling.svg";
import Send from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-461-send.svg";
import Plus from "icons/glyphicons-pro/glyphicons-basic-2-4/svg/individual-svg/glyphicons-basic-371-plus.svg";

// TODO: Move elsewhere
function countLines(str: string): number {
    return (str.match(/\n/g) || '').length;
}

export interface IMessageBoxProps {
    channel?: Snowflake,
}

const typing_array_selector = createSelector(
    activeRoom,
    (state: RootState) => state.chat.rooms,
    (active_room, rooms) => {
        let typing = active_room && rooms.get(active_room)?.typing;
        if(typing && typing.length > 0) return typing;
        return;
    }
);

const typing_selector = createSelector(
    typing_array_selector,
    activeParty,
    (state: RootState) => state.party.parties,
    (state: RootState) => state.user.user!,
    (users_typing, active_party, parties, user) => {
        if(!users_typing || !active_party) return;

        if(users_typing.length > 10) return "Many users are typing";

        let party = parties.get(active_party);

        if(!party) return;

        let typing_nicks = [];

        for(let entry of users_typing) {
            // skip self
            if(!__DEV__ && entry.user == user.id) continue;

            let member = party.members.get(entry.user);
            if(member) {
                let nick = member.nick || member.user?.username;
                nick && typing_nicks.push(nick);
                if(typing_nicks.length > 3) break;
            }
        }

        let res, len = typing_nicks.length, remaining = users_typing.length - typing_nicks.length;

        if(len == 0) return;
        else if(len == 1) {
            res = typing_nicks[0] + ' is typing...';
        } else if(remaining <= 0) {
            res = typing_nicks.slice(0, len - 1).join(', ') + ` and ${typing_nicks[len - 1]} are typing...`;
        } else {
            res = typing_nicks.join(', ') + ` and ${remaining} users are typing...`;
        }

        return res;
    }
)

const msg_box_selector = createStructuredSelector({
    msg: (state: RootState) => ({ messages: [] as any[], current_edit: null }),
    use_mobile_view: (state: RootState) => state.window.use_mobile_view,
    users_typing: typing_selector,
});


import "./box.scss";
export const MessageBox = React.memo(({ channel }: IMessageBoxProps) => {
    let disabled = !channel;

    let {
        msg: { messages, current_edit },
        use_mobile_view,
        users_typing
    } = useSelector(msg_box_selector);

    let dispatch = useDispatch();

    let ref = useRef<HTMLTextAreaElement>(null);
    //let file_ref = useRef<HTMLInputElement>(null);

    let keyRef = __DEV__ ? useRef<HTMLSpanElement>(null) : undefined;

    interface MsgBoxState {
        value: string,
        backup: string | null,
        isEditing: boolean,
        ts: number,
    }

    let [files, setFiles] = useState<FileList | null>(null);
    let [focused, setFocus] = useState(false);
    let [state, setState] = useState<MsgBoxState>({
        value: "",
        backup: null,
        isEditing: false,
        ts: 0,
    });

    if(state.isEditing === true && current_edit == null) { // in edit-mode but no message is selected for edit
        setState({ ...state, isEditing: false, value: "" });

    } else if(state.isEditing === false && state.backup != null) { // not editing but there is a backup value
        setState({ ...state, value: state.backup, backup: null });

    } else if(state.isEditing === false && current_edit != null) { // not editing but there is a message that needs editing
        // backup value only if there isn't already a backup (like if the message being edited changed)
        setState({
            ...state,
            backup: state.backup || state.value,
            value: messages.find((msg) => msg.id == current_edit)!.msg,
            isEditing: true,
        });
    }

    let do_nothing = useCallback(() => { }, []);

    let do_send = () => {
        dispatch(sendMessage(channel!, state.value));
        //dispatch({ type: state.isEditing ? Type.MESSAGE_SEND_EDIT : Type.MESSAGE_SEND, payload: state.value });
        setState({ ...state, value: "" });
    };

    let open_upload_click = disabled ? do_nothing : (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        e.stopPropagation(); // prevent refocus if not focused

        //if(file_ref.current) {
        //    file_ref.current.click();
        //}

        if(focused) {
            ref.current!.focus(); // refocus just in-case, since on Safari it blurs automatically
        }
    };

    let on_send_click = disabled ? do_nothing : (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        e.stopPropagation(); // prevent refocus if not focused

        if(state.value.length > 0) {
            do_send();
        }

        if(focused) {
            ref.current!.focus(); // refocus just in-case, since on Safari it blurs automatically
        }
    };

    let on_keyup = useCallback((e: React.KeyboardEvent) => {
        let hotkey = parseHotkey(e);
        if(!hotkey || hotkey == Hotkey.FocusTextArea) {
            // not-hotkeys shouldn't escape, to save on processing time of keypress
            // or if the textarea is already focused, don't refocus
            e.stopPropagation();
        }
    }, []);

    let on_keydown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if(__DEV__) {
            keyRef!.current!.innerText = (e.ctrlKey ? 'Ctrl+' : '') + (e.altKey ? 'Alt+' : '') + (e.shiftKey ? 'Shift+' : '') + (e.key === ' ' ? 'Spacebar' : e.key);
        }

        e.stopPropagation();

        let isInsideCodeblock = () => {
            let cursor = ref.current!.selectionStart;

            // check if the cursor is inside a code block, in which case allow plain newlines
            let prev = { index: 0 }, delim, re = /`{3}/g, inside = false;
            for(let idx = 0; delim = re.exec(state.value); idx++) {
                if(prev.index <= cursor && cursor > delim.index) {
                    inside = !inside;
                }
                prev = delim;
            }

            return inside;
        };

        switch(e.key) {
            case 'Enter': {
                if(use_mobile_view || e.shiftKey || state.value.length === 0 || isInsideCodeblock()) return;

                e.preventDefault(); // don't add the newline

                do_send();

                break;
            }
            case 'Tab': {
                // TODO: Remove this?
                if(e.shiftKey || isInsideCodeblock()) {
                    setState({ ...state, value: state.value + '\t' });
                }

                e.preventDefault();

                break;
            }
            case 'ArrowUp':
            case 'ArrowDown': {
                let total_lines = countLines(state.value);
                let current_line = countLines(state.value.slice(0, ref.current!.selectionStart));

                if(e.key === 'ArrowUp' && current_line === 0) {
                    dispatch({ type: Type.MESSAGE_EDIT_PREV });
                } else if(e.key === 'ArrowDown' && current_line === total_lines) {
                    dispatch({ type: Type.MESSAGE_EDIT_NEXT });
                } else {
                    return;
                }

                setState({ ...state, isEditing: false }); // trigger reload
                break;
            }
            case 'Escape':
            case 'Esc': {
                if(state.isEditing) { dispatch({ type: Type.MESSAGE_DISCARD_EDIT }); }
                break;
            }
        }
    };

    let on_change = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        // the "Enter" key newline is still present after keydown, so trim that
        // also prevents leading newlines
        let ts = Date.now(), new_value = e.currentTarget.value.replace(/^\n+/, '');

        // NOTE: What qualifies as "typing" is adding more characters
        if(channel && new_value.length > state.value.length && (ts - state.ts) > 3500) {
            dispatch(startTyping(channel));
        } else {
            // use old value if not sent
            ts = state.ts;
        }

        setState({ ...state, value: new_value, ts });
    };

    let main = useContext(MainContext);

    let on_click_focus = useCallback((e: React.MouseEvent) => {
        if(disabled) return;
        main.clickAll(e);
        e.stopPropagation();
        ref.current!.focus();
    }, [disabled]);

    //let [tabIndex, setTabIndex] = useState(0);

    useMainHotkey(Hotkey.FocusTextArea, () => {
        if(disabled) return;

        // TODO: Iterate over items in box
        //let c = ref.current!, is_focused = document.activeElement == c;
        //if(!is_focused) {}

        ref.current!.focus();
    });

    let on_file_change = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        __DEV__ && console.log("File list changed");

        setFiles(e.currentTarget.files);
    }, []);

    let on_file_close = () => {
        setFiles(null);
    }

    let is_empty = state.value.length == 0;

    let on_right_click = is_empty ? open_upload_click : on_send_click;

    // https://github.com/buildo/react-autosize-textarea/issues/52
    return (
        <>
            {files?.length ? <FileUploadModal onClose={on_file_close} files={files} /> : null}

            <div className={"ln-msg-box" + (disabled ? ' ln-msg-box--disabled' : '')} onClick={on_click_focus}>
                {disabled ? <span className="ln-msg-box__disable"></span> : null}

                <div className="ln-typing ln-typing__top">
                    {(use_mobile_view && users_typing) ? <span>{users_typing}</span> : null}
                </div>

                <EmotePicker />

                <div className="ln-msg-box__box">
                    <TextareaAutosize disabled={disabled}
                        onBlur={() => setTimeout(() => setFocus(false), 0)} // don't run on same frame?
                        onFocus={() => setFocus(true)}
                        cacheMeasurements={false}
                        ref={ref}
                        placeholder="Message..."
                        rows={1} maxRows={use_mobile_view ? 5 : 20}
                        value={state.value} onKeyDown={on_keydown} onChange={on_change} onKeyUp={on_keyup} />
                </div>

                {
                    __DEV__ && <div className="ln-msg-box__debug"><span ref={keyRef}></span></div>
                }

                <div className="ln-msg-box__send" onClick={on_right_click} onTouchEnd={on_right_click}>
                    {is_empty ? <input multiple type="file" name="file_upload" onChange={on_file_change} /> : null}
                    <Glyphicon src={is_empty ? Plus : Send} />
                </div>
            </div>

            <div className="ln-typing ln-typing__bottom">
                <span>{use_mobile_view ? null : users_typing}</span>
            </div>
        </>
    );
});