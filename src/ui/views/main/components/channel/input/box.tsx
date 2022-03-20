import { createEffect, createMemo, createSignal, onCleanup, Show, untrack, useContext } from "solid-js";
import { useDispatch, useStore, useStructuredSelector } from "solid-mutant";

import { createRef } from "ui/hooks/createRef";
import { createReducer } from "ui/hooks/createReducer";

import { IS_MOBILE } from "lib/user_agent";

//import { IMessageState } from "ui/views/main/reducers/messages";
import { Action, RootState, useRootSelector } from "state/root";
import { Type } from "state/actions";
import { PartyMember, Snowflake, User, UserPreferenceFlags } from "state/models";
import { IParty } from "state/mutators/party";
import { sendMessage, startTyping } from "state/commands";
import { activeParty, activeRoom } from "state/selectors/active";
import { selectPrefsFlag } from "state/selectors/prefs";
import { ITypingState } from "state/mutators/chat";

//import { FileUploadModal } from "ui/views/main/modals/file_upload";
import { Hotkey, MainContext, createClickEater, useMainHotkey } from "ui/hooks/useMain";

import { VectorIcon } from "ui/components/common/icon";
import { IMsgTextareaController, MsgTextarea } from "ui/components/input/msg_textarea";
import { EmotePicker } from "../common/emote_picker";

//import {SmileyIcon} from "lantern-icons";
import { SendIcon } from "lantern-icons";
import { PlusIcon } from "lantern-icons";
import { createController } from "ui/hooks/createController";

import "./box.scss";
export function MessageBox() {
    let state = useStructuredSelector({
        active_room: activeRoom,
        //msg: (state: RootState) => ({ messages: [] as any[], current_edit: null }), // TODO
        use_mobile_view: (state: RootState) => state.window.use_mobile_view,
        showing_footers: (state: RootState) => state.window.showing_footers,
        session: (state: RootState) => state.user.session,
        enable_spellcheck: selectPrefsFlag(UserPreferenceFlags.EnableSpellcheck),
    });

    let dispatch = useDispatch();

    let main = useContext(MainContext);

    let [debug, setDebug] = /*#__PURE__*/ createSignal("");

    let ta = createRef<HTMLTextAreaElement>();
    let [tac, setTAC] = createController<IMsgTextareaController>();

    let [value, setValue] = createSignal("");
    let ts = 0, skip = false;

    let [show_focus_border, setShowFocusBorder] = createSignal(false);

    createEffect(() => {
        // focus textarea on desktop when active room changes
        if(!IS_MOBILE && state.active_room) { tac()!.focus(); }
    });

    // Load up any available draft, set the textarea to that,
    // then setup a callback to store the new draft when navigating away
    createEffect(() => {
        if(ta.current && state.active_room) {
            __DEV__ && console.log("Loading Draft");

            let room = state.active_room;

            onCleanup(() => {
                __DEV__ && console.log("Storing Draft");
                ta.current && dispatch({ type: Type.MESSAGE_DRAFT, room, draft: untrack(value) });
            });

            skip = true; // skip the change event this will emit
            untrack(() => tac()!.setValue(useStore<RootState, Action>().state.chat.rooms[state.active_room!]?.draft || ""));
        }
    });

    useMainHotkey(Hotkey.FocusTextArea, () => {
        if(ta.current && state.active_room) {
            tac()!.focus(); setShowFocusBorder(true);
        }
    });

    let do_send = () => {
        if(state.active_room) {
            dispatch(sendMessage(state.active_room, value().trim()));
            tac()!.setValue("");
            ts = 0; // reset typing timestamp
        }
    };

    let focused = false;

    let on_focus = () => {
        focused = true;
    };

    let on_blur = () => {
        setTimeout(() => {
            focused = false;
            setShowFocusBorder(false);
        }, 0);
    };

    let eat = createClickEater();

    let on_send_click = (e: MouseEvent) => {
        eat(e);

        let f = focused;
        if(value()) {
            do_send();

            // refocus if lost
            if(f) { tac()!.focus(); }
        }
    };

    let on_keydown = (e: KeyboardEvent) => {
        setShowFocusBorder(false);

        if(e.key == 'Enter') { do_send(); }

        if(__DEV__) {
            setDebug(
                (e.ctrlKey ? 'Ctrl+' : '') +
                (e.altKey ? 'Alt+' : '') +
                (e.shiftKey ? 'Shift+' : '') +
                (e.key === ' ' ? 'Spacebar' : e.key)
            );
        }
    };

    let on_change = (new_value: string) => {
        let old_value = value();
        let new_ts = Date.now();

        if(!skip && state.active_room && new_value.length > old_value.length && (new_ts - ts) > 3500) {
            dispatch(startTyping(state.active_room));
            ts = new_ts;
        }

        skip = false;

        setValue(new_value);
    };

    let on_click_focus = (e: MouseEvent) => {
        eat(e); if(state.active_room) { tac()!.focus(); }
    };

    let debug_node; if(__DEV__) {
        debug_node = (<div className="ln-msg-box__debug"><span>{debug()}</span></div>);
    }

    return (
        <>
            <div
                onClick={on_click_focus}
                className="ln-msg-box"
                classList={{
                    'ln-msg-box--disabled': !state.active_room,
                    'focused': show_focus_border(),
                    'with-footers': state.showing_footers,
                }}
            >
                <div className="ln-typing ln-typing__top">
                    <Show when={state.use_mobile_view}>
                        <UsersTyping />
                    </Show>
                </div>

                <EmotePicker />

                <MsgTextarea
                    onBlur={on_blur}
                    onFocus={on_focus}
                    ta={ta}
                    tac={setTAC}
                    onKeyDown={on_keydown}
                    onChange={on_change}
                    mobile={state.use_mobile_view}
                    onContextMenu={eat}
                    spellcheck={state.enable_spellcheck}
                />

                {debug_node}

                <div className="ln-msg-box__send" onClick={value().length == 0 ? undefined : on_send_click}>
                    <VectorIcon src={value().length == 0 ? PlusIcon : SendIcon} />
                </div>

                <Show when={!state.active_room}>
                    <span className="ln-msg-box__disable" />
                </Show>
            </div>

            <div className="ln-typing ln-typing__bottom">
                <Show when={!state.use_mobile_view}>
                    <UsersTyping />
                </Show>
            </div>
        </>
    )
}

function UsersTyping() {
    let formatted = useRootSelector(state => {
        let active_party = activeParty(state),
            active_room = activeRoom(state);

        if(active_party && active_room) {
            let typing = state.chat.rooms[active_room]?.typing;
            if(typing && typing.length) {
                return format_users_typing(
                    typing,
                    state.party.parties[active_party].members,
                    state.user.user!.id,
                );
            }
        }
        return;
    });

    return (
        <Show when={formatted()}>
            {formatted => <span className="ui-text">{formatted}</span>}
        </Show>
    )
}

function format_users_typing(
    typing: DeepReadonly<Array<ITypingState>>,
    members: DeepReadonly<Record<Snowflake, PartyMember>>,
    user_id: Snowflake): string | undefined {

    let typing_nicks = [],
        remaining = typing.length;

    for(let entry of typing) {
        // skip self
        if(!__DEV__ && entry.user == user_id) {
            remaining -= 1;
            continue;
        };

        // pick out a max of 3 names to display before it shows "and X"
        let member = members[entry.user];
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