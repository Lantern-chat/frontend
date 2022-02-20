import React, { ChangeEventHandler, forwardRef, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector, createStructuredSelector } from "reselect";
import classNames from "classnames";

import TextareaAutosize, { TextareaHeightChangeMeta } from 'react-textarea-autosize';

import { countLines } from "lib/util";
import { IS_MOBILE } from "lib/user_agent";

//import { IMessageState } from "ui/views/main/reducers/messages";
import { RootState } from "state/root";
import { Type } from "state/actions";
import { PartyMember, Snowflake, User } from "state/models";
import { sendMessage, startTyping } from "state/commands";
import { activeParty, activeRoom } from "state/selectors/active";
import { ITypingState } from "state/reducers/chat";

import { FileUploadModal } from "ui/views/main/modals/file_upload";
import { Hotkey, MainContext, parseHotkey, useMainHotkey } from "ui/hooks/useMainClick";

import { VectorIcon } from "ui/components/common/icon";
import { EmotePicker } from "../common/emote_picker";

//import {SmileyIcon} from "ui/assets/icons";
import { SendIcon } from "ui/assets/icons";
import { PlusIcon } from "ui/assets/icons";

export interface IMessageBoxProps {
    channel?: Snowflake,
}

const msg_box_selector = createStructuredSelector({
    active_room: activeRoom,
    msg: (state: RootState) => ({ messages: [] as any[], current_edit: null }), // TODO
    use_mobile_view: (state: RootState) => state.window.use_mobile_view,
    showing_footers: (state: RootState) => state.window.showing_footers,
    session: (state: RootState) => state.user.session,
});

import "./box.scss";
export const MessageBox = React.memo(({ channel }: IMessageBoxProps) => {
    let disabled = !channel;

    let {
        msg: { messages, current_edit },
        use_mobile_view,
        active_room,
        showing_footers,
        session,
    } = useSelector(msg_box_selector);

    let dispatch = useDispatch();

    let ref = useRef<HTMLTextAreaElement>(null);
    //let file_ref = useRef<HTMLInputElement>(null);

    // focus text-area on room navigation
    useEffect(() => {
        let ta = ref.current;
        if(ta && !IS_MOBILE) { ta.focus(); }
    }, [ref.current, active_room]);

    let keyRef = __DEV__ ? useRef<HTMLSpanElement>(null) : undefined;

    interface MsgBoxState {
        value: string,
        backup: string | null,
        isEditing: boolean,
        ts: number,
    }

    let [files, setFiles] = useState<FileList | null>(null);

    let [focused, setFocused] = useState(false);
    let [showFocusBorder, setShowFocusBorder] = useState(false);
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
        dispatch(sendMessage(channel!, state.value.trim()));
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
        let hotkey = parseHotkey(e.nativeEvent);
        if(hotkey == null || hotkey == Hotkey.FocusTextArea) {
            // not-hotkeys shouldn't escape, to save on processing time of keypress
            // or if the textarea is already focused, don't refocus
            e.stopPropagation();
        }
    }, []);

    let on_keydown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        setShowFocusBorder(false);

        if(__DEV__) {
            keyRef!.current!.innerText = (e.ctrlKey ? 'Ctrl+' : '') + (e.altKey ? 'Alt+' : '') + (e.shiftKey ? 'Shift+' : '') + (e.key === ' ' ? 'Spacebar' : e.key);
        }

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

        let stop_prop = true;

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
                let total_lines = countLines(state.value),
                    current_line = countLines(state.value.slice(0, ref.current!.selectionStart));

                // if on the first line
                if(e.key === 'ArrowUp' && current_line === 1) {
                    dispatch({ type: Type.MESSAGE_EDIT_PREV });
                }
                // else if on the last line
                else if(e.key === 'ArrowDown' && current_line === (total_lines - 1)) {
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

            // HOTKEY allowances

            case 'PageUp':
            case 'PageDown': {
                stop_prop = false;
                break;
            }
            default: {
                if(e.ctrlKey || e.metaKey) {
                    stop_prop = false;
                }
            }
        }

        if(stop_prop) {
            e.stopPropagation();
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

    let on_blur = useCallback(() => {
        setTimeout(() => { setFocused(false); setShowFocusBorder(false); }, 0);
    }, []);

    let main = useContext(MainContext);

    let on_click_focus = useCallback((e: React.MouseEvent) => {
        if(disabled) return;
        main.clickAll(e);
        e.stopPropagation();
        ref.current!.focus();
    }, [disabled]);

    //let [tabIndex, setTabIndex] = useState(0);

    useMainHotkey(Hotkey.FocusTextArea, () => {
        let ta = ref.current;
        if(!disabled && ta) { ta.focus(); setShowFocusBorder(true); }
    }, [disabled]);

    let on_file_change = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        __DEV__ && console.log("File list changed");

        setFiles(e.currentTarget.files);
    }, []);

    let on_file_close = useCallback(() => {
        setFiles(null);
    }, []);

    let is_empty = state.value.length == 0;

    let on_right_click = is_empty ? open_upload_click : on_send_click;

    let on_cm = useCallback((e: React.MouseEvent) => {
        main.clickAll(e);
        e.stopPropagation();
    }, []);

    let [rows, setRows] = useState(1);
    let onHeightChange = useCallback((height: number, { rowHeight }: TextareaHeightChangeMeta) => {
        setRows(Math.floor(height / rowHeight));
    }, []);

    let max_rows = use_mobile_view ? 5 : 20;

    let style;
    if(rows < max_rows) {
        style = { overflowY: 'hidden' };
    }

    let box_classes = classNames("ln-msg-box", {
        'ln-msg-box--disabled': disabled,
        'focused': showFocusBorder,
        'with-footers': showing_footers,
    });

    // https://github.com/buildo/react-autosize-textarea/issues/52
    return (
        <>
            {(files?.length && session?.auth && active_room) ? <FileUploadModal onClose={on_file_close} files={files} bearer={session.auth} room_id={active_room} /> : null}

            <div className={box_classes} onClick={on_click_focus}>
                {disabled ? <span className="ln-msg-box__disable"></span> : null}

                <div className="ln-typing ln-typing__top">
                    {use_mobile_view ? <UsersTyping /> : null}
                </div>

                <EmotePicker />

                <div className="ln-msg-box__box">
                    <TextareaAutosize disabled={disabled}
                        onBlur={on_blur} // don't run on same frame?
                        onFocus={() => setFocused(true)}
                        cacheMeasurements={false}
                        ref={ref}
                        placeholder="Message..."
                        rows={1} maxRows={max_rows} style={style as any}
                        value={state.value}
                        onKeyDown={on_keydown} onChange={on_change} onKeyUp={on_keyup}
                        onContextMenu={on_cm}
                        onHeightChange={onHeightChange}
                    />
                </div>

                {
                    __DEV__ && <div className="ln-msg-box__debug"><span ref={keyRef}></span></div>
                }

                <div className="ln-msg-box__send" onClick={on_right_click} onTouchEnd={on_right_click}>
                    <input multiple type={is_empty ? "file" : "text"} name="file_upload" onChange={on_file_change}
                        style={is_empty ? undefined : { zIndex: -999, left: -999, pointerEvents: 'none', display: 'none' }}
                    />
                    <VectorIcon src={is_empty ? Plus : Send} />
                </div>
            </div>

            <div className="ln-typing ln-typing__bottom">
                {use_mobile_view ? null : <UsersTyping />}
            </div>
        </>
    );
});

const typing_selector = createSelector(
    activeRoom,
    activeParty,
    (state: RootState) => state.chat.rooms,
    (state: RootState) => state.party.parties,
    (state: RootState) => state.user.user!,
    (active_room, active_party, rooms, parties, user) => {
        let typing = active_room && rooms.get(active_room)?.typing,
            users_typing = (typing && typing.length > 0) ? typing : undefined;

        if(!users_typing || !active_party) return;

        let party = parties.get(active_party);
        if(!party) return;

        return {
            members: party.members,
            users_typing,
            user,
        }
    }
);

function format_users_typing(user: User, members: Map<Snowflake, PartyMember>, users_typing: ITypingState[]): string | undefined {
    let typing_nicks = [], remaining = users_typing.length;

    for(let entry of users_typing) {
        // skip self
        if(!__DEV__ && entry.user == user.id) {
            remaining -= 1;
            continue;
        };

        let member = members.get(entry.user);
        if(member) {
            let nick = member.nick || member.user.username;

            if(nick) {
                typing_nicks.push(nick);
                if(typing_nicks.length > 3) break;
            }
        }
    }

    remaining -= typing_nicks.length;

    let res, len = typing_nicks.length;

    if(len == 0) return;
    else if(len == 1) {
        res = typing_nicks[0] + ' is typing...';
    } else if(remaining <= 0) {
        res = typing_nicks.slice(0, len - 1).join(', ') + ` and ${typing_nicks[len - 1]} are typing...`;
    } else {
        let user_plural = remaining > 1 ? "users" : "user";

        res = typing_nicks.join(', ') + ` and ${remaining} ${user_plural} are typing...`;
    }

    return res;
}

const UsersTyping = React.memo(() => {
    let res = useSelector(typing_selector);
    if(!res) return null;

    let users_typing = format_users_typing(res.user, res.members, res.users_typing);
    if(!users_typing) return null;

    return (
        <span className="ui-text">{users_typing}</span>
    )
})