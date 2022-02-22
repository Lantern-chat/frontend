import classNames from "classnames";

import React, { useCallback, useContext, useLayoutEffect, useReducer, useRef } from "react";
import { useSelector, useStore } from "react-redux";
import { createSelector, createStructuredSelector } from "reselect";

import { selectPrefsFlag } from "state/selectors/prefs";

import { IS_MOBILE } from "lib/user_agent";

//import { IMessageState } from "ui/views/main/reducers/messages";
import { DispatchableAction, RootState } from "state/root";
import { Type } from "state/actions";
import { PartyMember, Snowflake, User, UserPreferenceFlags } from "state/models";
import { sendMessage, startTyping } from "state/commands";
import { activeParty, activeRoom } from "state/selectors/active";
import { ITypingState } from "state/reducers/chat";

import { FileUploadModal } from "ui/views/main/modals/file_upload";
import { useForceRender } from "ui/hooks/useForceRender";
import { Hotkey, MainContext, useClickEater, useMainHotkey } from "ui/hooks/useMainClick";

import { VectorIcon } from "ui/components/common/icon";
import { MsgTextarea } from "ui/components/input/textarea";
import { EmotePicker } from "../common/emote_picker";

//import {SmileyIcon} from "lantern-icons";
import { SendIcon } from "lantern-icons";
import { PlusIcon } from "lantern-icons";

const msg_box_selector = createStructuredSelector({
    active_room: activeRoom,
    msg: (state: RootState) => ({ messages: [] as any[], current_edit: null }), // TODO
    use_mobile_view: (state: RootState) => state.window.use_mobile_view,
    showing_footers: (state: RootState) => state.window.showing_footers,
    session: (state: RootState) => state.user.session,
    enable_spellcheck: selectPrefsFlag(UserPreferenceFlags.EnableSpellcheck),
});

interface IMessageBoxState {
    /// Files selected
    files: FileList | null,

    /// Timestamp of last things
    ts: number,

    /// If the textarea is focused
    focused: boolean,

    /// If to show the focus border around the message box
    show_focus: boolean,
}

const DEFAULT_MSG_BOX_STATE: IMessageBoxState = {
    files: null,
    ts: 0,
    focused: false,
    show_focus: false,
};


enum MsgBoxActionType {
    SetTs,
    SetFocus,
    SetShowFocus,
    SetFiles,
}

interface MsgBoxActionSetTs {
    t: MsgBoxActionType.SetTs,
    ts: number,
}

interface MsgBoxActionSetFocus {
    t: MsgBoxActionType.SetFocus,
    v: boolean,
}

interface MsgBoxActionSetShowFocus {
    t: MsgBoxActionType.SetShowFocus,
    v: boolean,
}

interface MsgBoxActionSetFiles {
    t: MsgBoxActionType.SetFiles,
    v: FileList | null,
}


type MsgBoxAction = MsgBoxActionSetTs | MsgBoxActionSetFocus | MsgBoxActionSetShowFocus | MsgBoxActionSetFiles;

function msg_box_reducer(state: IMessageBoxState, action: MsgBoxAction): IMessageBoxState {

    switch(action.t) {
        case MsgBoxActionType.SetTs: {
            return { ...state, ts: action.ts };
        }
        case MsgBoxActionType.SetFocus: {
            return { ...state, focused: action.v };
        }
        case MsgBoxActionType.SetShowFocus: {
            return { ...state, show_focus: action.v };
        }
        case MsgBoxActionType.SetFiles: {
            return { ...state, files: action.v };
        }
    }

    return state;
}

import "./box.scss";
export const MessageBoxOld = React.memo(() => {
    let {
        msg: { messages, current_edit },
        use_mobile_view,
        active_room,
        showing_footers,
        session,
        enable_spellcheck,
    } = useSelector(msg_box_selector);

    let store = useStore<RootState, any & DispatchableAction>(),
        dispatch = store.dispatch,
        main = useContext(MainContext),
        ref = useRef<MsgTextarea>(null),
        keyRef = __DEV__ ? useRef<HTMLSpanElement>(null) : undefined;

    let [state, dispatchBox] = useReducer(msg_box_reducer, DEFAULT_MSG_BOX_STATE);
    let state_ref = useRef(state);
    state_ref.current = state;

    // focus text-area on room navigation
    useLayoutEffect(() => {
        let ta = ref.current;
        if(ta && !IS_MOBILE) ta.focus();
    }, [ref.current, active_room]);

    // Load up any available draft, set the textarea to that,
    // then setup a callback to store the new draft when navigating away
    useLayoutEffect(() => {
        let ta = ref.current;
        if(ta && active_room) {
            let room = store.getState().chat.rooms.get(active_room),
                draft = room ? room.draft : "";

            // FIXME: Avoid triggering a typing event when setting draft value
            ta.setValue(draft);

            return () => {
                let ta = ref.current;
                ta && dispatch({ type: Type.MESSAGE_DRAFT, room: active_room, draft: ta.value });
            }
        }
        return;
    }, [active_room]);

    // Focus on Tab hotkey
    useMainHotkey(Hotkey.FocusTextArea, () => {
        let ta = ref.current;
        if(active_room && ta) {
            ta.focus();
            // also show the fancy border
            dispatchBox({ t: MsgBoxActionType.SetShowFocus, v: true });
        }
    }, [active_room]);

    let do_send = useCallback(() => {
        if(active_room) {
            let ta = ref.current!;
            dispatch(sendMessage(active_room, ta.value.trim()));
            ta.setValue("");
            dispatchBox({ t: MsgBoxActionType.SetTs, ts: 0 });
        }
    }, [active_room]);

    let on_upload_click = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        main.clickAll(e);

        // refocus just in-case, since on Safari it blurs automatically
        if(state_ref.current.focused) {
            ref.current!.focus();
        }
    }, []);

    let on_send_click = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        main.clickAll(e);

        let ta = ref.current!, { focused } = state_ref.current;
        if(ta.value) { do_send(); }

        // refocus just in-case, since on Safari it blurs automatically
        if(focused) {
            ta.focus();
        }
    }, [do_send]);

    let on_keydown = useCallback((e: React.KeyboardEvent) => {
        dispatchBox({ t: MsgBoxActionType.SetShowFocus, v: false });
        if(e.key == 'Enter') { do_send(); }

        if(__DEV__) {
            keyRef!.current!.innerText = (e.ctrlKey ? 'Ctrl+' : '') + (e.altKey ? 'Alt+' : '') + (e.shiftKey ? 'Shift+' : '') + (e.key === ' ' ? 'Spacebar' : e.key);
        }
    }, [do_send]);

    // passively keep track of value on change, and force render when needed to refresh UI
    let value = useRef(""), forceRender = useForceRender();

    let on_change = useCallback((new_value: string) => {
        let old_value = value.current,
            new_ts = Date.now(), { ts } = state_ref.current;

        if(active_room && new_value.length > old_value.length && (new_ts - ts) > 3500) {
            dispatch(startTyping(active_room));
            dispatchBox({ t: MsgBoxActionType.SetTs, ts: new_ts });
        }

        value.current = new_value;

        // Refresh UI to switch between send/file stuff
        if(new_value.length <= 1) {
            __DEV__ && console.log("Swapping icons");
            forceRender();
        }
    }, []);

    let on_focus = useCallback(() => {
        dispatchBox({ t: MsgBoxActionType.SetFocus, v: true });
    }, []);

    let on_blur = useCallback(() => {
        setTimeout(() => {
            dispatchBox({ t: MsgBoxActionType.SetFocus, v: false });
            dispatchBox({ t: MsgBoxActionType.SetShowFocus, v: false });
        }, 0);
    }, []);

    // clicking anywhere on the message box should focus the textarea
    let on_click_focus = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        main.clickAll(e);

        if(active_room) { ref.current!.focus(); }
    }, [active_room]);

    let on_file_change = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        dispatchBox({ t: MsgBoxActionType.SetFiles, v: e.target.files });
    }, []);

    let on_file_close = useCallback(() => {
        dispatchBox({ t: MsgBoxActionType.SetFiles, v: null });
    }, []);

    let is_empty = value.current.length == 0;

    let on_right_click = is_empty ? on_upload_click : on_send_click;

    let on_cm = useClickEater();

    let box_classes = classNames("ln-msg-box", {
        'ln-msg-box--disabled': !active_room,
        'focused': state.show_focus,
        'with-footers': showing_footers,
    });

    return (
        <>
            {(state.files?.length && session?.auth && active_room) ?
                <FileUploadModal onClose={on_file_close} files={state.files} bearer={session.auth} room_id={active_room} /> : null}

            <div className={box_classes} onClick={on_click_focus}>
                {!active_room ? <span className="ln-msg-box__disable"></span> : null}

                <div className="ln-typing ln-typing__top">
                    {use_mobile_view ? <UsersTyping /> : null}
                </div>

                <EmotePicker />

                <MsgTextarea
                    onBlur={on_blur}
                    onFocus={on_focus}
                    ref={ref}
                    onKeyDown={on_keydown}
                    onChange={on_change}
                    mobile={use_mobile_view}
                    onContextMenu={on_cm}
                    spellcheck={enable_spellcheck}
                />

                {
                    __DEV__ && <div className="ln-msg-box__debug"><span ref={keyRef}></span></div>
                }

                <div className="ln-msg-box__send" onClick={on_right_click}>
                    <input multiple type={is_empty ? "file" : "text"} name="file_upload" onChange={on_file_change}
                        style={is_empty ? undefined : { zIndex: -999, left: -999, pointerEvents: 'none', display: 'none' }}
                    />
                    <VectorIcon src={is_empty ? PlusIcon : SendIcon} />
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

        // pick out a max of 3 names to display before it shows "and X"
        let member = members.get(entry.user);
        if(member) {
            let nick = member.nick || member.user.username;

            if(nick) {
                typing_nicks.push(nick);
                if(typing_nicks.length > 3) break;
            }
        }
    }

    // decrement remaining count by the count selected for listing
    remaining -= typing_nicks.length;

    let res, len = typing_nicks.length;

    if(len == 0) return; // no one is typing
    else if(len == 1) {
        // OneUser is typing...
        res = typing_nicks[0] + ' is typing...';
    } else if(remaining <= 0) {
        // FIXME: Remove oxford comma in two-user case
        // Foo, Bar, and Cathy are typing...
        res = typing_nicks.slice(0, len - 1).join(', ') + `, and ${typing_nicks[len - 1]} are typing...`;
    } else {
        // Foo, Bar, Cathy, and 10 other users are typing...
        // Foo, Bar, Cathy, and 1 other user are typing...
        let user_plural = remaining > 1 ? "users" : "user";

        res = typing_nicks.join(', ') + `, and ${remaining} other ${user_plural} are typing...`;
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
});

if(__DEV__) {
    UsersTyping.displayName = "UsersTyping";
    MessageBoxOld.displayName = "MessageBox";
}