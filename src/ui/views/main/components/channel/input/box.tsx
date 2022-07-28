import { createEffect, createMemo, createSignal, onCleanup, Show, untrack, useContext, Accessor } from "solid-js";
import { useStructuredSelector } from "solid-mutant";

import { createRef } from "ui/hooks/createRef";
import { createReducer } from "ui/hooks/createReducer";

import { IS_MOBILE } from "lib/user_agent";

//import { IMessageState } from "ui/views/main/reducers/messages";
import { Action, RootState, ReadRootState, useRootSelector, useRootStore, useRootDispatch } from "state/root";
import { Type } from "state/actions";
import { PartyMember, Snowflake, User, UserPreferenceFlags } from "state/models";
import { IParty } from "state/mutators/party";
import { sendMessage, startTyping } from "state/commands";
import { activeParty, activeRoom } from "state/selectors/active";
import { selectPrefsFlag } from "state/selectors/prefs";
import { ITypingState } from "state/mutators/chat";

//import { FileUploadModal } from "ui/views/main/modals/file_upload";
import { Hotkey, MainContext, createClickEater, useMainHotkey } from "ui/hooks/useMain";

import { useI18nContext } from "ui/i18n/i18n-solid";
import { UIText } from "ui/components/common/ui-text";
import { VectorIcon } from "ui/components/common/icon";
import { IMsgTextareaController, MsgTextarea } from "ui/components/input/msg_textarea";
import { EmotePicker } from "../common/emote_picker";

import { Icons } from "lantern-icons";
import { createController } from "ui/hooks/createController";

import "./box.scss";
interface IMessageBox{
    typingMessageValue: Accessor<string>;
    typeMessage: (message: string) => void;
    changeCursorPosition: (position: number) => void;
    showingSuggestions: Accessor<boolean>;
}
export function MessageBox(props: IMessageBox) {
    let state = useStructuredSelector({
        active_room: activeRoom,
        //msg: (state: ReadRootState) => ({ messages: [] as any[], current_edit: null }), // TODO
        use_mobile_view: (state: ReadRootState) => state.window.use_mobile_view,
        showing_footers: (state: ReadRootState) => state.window.showing_footers,
        session: (state: ReadRootState) => state.user.session,
        enable_spellcheck: selectPrefsFlag(UserPreferenceFlags.EnableSpellcheck),
    });

    let dispatch = useRootDispatch();

    let main = useContext(MainContext);

    let [debug, setDebug] = /*#__PURE__*/ createSignal("");

    let ta = createRef<HTMLTextAreaElement>();
    let [tac, setTAC] = createController<IMsgTextareaController>();

    let ts = 0, skip = false;

    let [show_focus_border, setShowFocusBorder] = createSignal(false);

    createEffect(() => {
        // focus textarea on desktop when active room changes
        if(!IS_MOBILE && state.active_room) { tac()!.focus(); }
    });

    // Load up any available draft, set the textarea to that,
    // then setup a callback to store the new draft when navigating away
    let store = useRootStore();
    createEffect(() => {
        if(ta.current && state.active_room) {
            __DEV__ && console.log("Loading Draft");

            let room = state.active_room;

            onCleanup(() => {
                __DEV__ && console.log("Storing Draft");
                ta.current && dispatch({ type: Type.MESSAGE_DRAFT, room, draft: untrack(props.typingMessageValue) });
            });

            skip = true; // skip the change event this will emit
            untrack(() => tac()!.setValue(store.state.chat.rooms[state.active_room!]?.draft || ""));
        }
    });

    useMainHotkey(Hotkey.FocusTextArea, () => {
        if(ta.current && state.active_room) {
            tac()!.focus(); setShowFocusBorder(true);
        }
    });

    let do_send = () => {
        if(state.active_room) {
            dispatch(sendMessage(state.active_room, props.typingMessageValue().trim()));
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
        eat(e); if(props.typingMessageValue()) {
            let f = focused;

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
        let old_value = props.typingMessageValue();
        let new_ts = Date.now();

        if(!skip && state.active_room && new_value.length > old_value.length && (new_ts - ts) > 3500) {
            dispatch(startTyping(state.active_room));
            ts = new_ts;
        }

        skip = false;

        props.typeMessage(new_value);
    };

    let on_click_focus = (e: MouseEvent) => {
        eat(e); if(state.active_room) { tac()!.focus(); }
    };

    let debug_node; if(__DEV__) {
        debug_node = (<div class="ln-msg-box__debug"><span textContent={debug()} /></div>);
    }

    let is_empty = createMemo(() => props.typingMessageValue().length == 0);

    return (
        <>
            <div
                onClick={on_click_focus}
                class="ln-msg-box"
                classList={{
                    'ln-msg-box--disabled': !state.active_room,
                    'focused': show_focus_border(),
                    'with-footers': state.showing_footers,
                }}
            >
                <div class="ln-typing ln-typing__top">
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
                    changeCursorPosition={props.changeCursorPosition}
                    value={props.typingMessageValue()}
                    showingSuggestions={props.showingSuggestions}
                />

                {debug_node}

                <div class="ln-msg-box__send" onClick={on_send_click}>
                    <VectorIcon id={is_empty() ? Icons.Plus : Icons.Send} />
                </div>

                <Show when={!state.active_room}>
                    <span class="ln-msg-box__disable" />
                </Show>
            </div>

            <div class="ln-typing ln-typing__bottom">
                <Show when={!state.use_mobile_view}>
                    <UsersTyping />
                </Show>
            </div>
        </>
    )
}

function UsersTyping() {
    let { LL } = useI18nContext();

    let formatted = useRootSelector(state => {
        let active_party = activeParty(state),
            active_room = activeRoom(state);

        if(active_room && active_party) {
            let typing = state.chat.rooms[active_room]?.typing;
            if(typing?.length) {
                let selected = [],
                    remaining = typing.length,
                    members = state.party.parties[active_party].members,
                    user_id = state.user.user!.id;

                for(let entry of typing) {
                    remaining -= 1;

                    if(!__DEV__ && entry.user == user_id) {
                        // skip self
                        continue;
                    }

                    let member = members[entry.user];
                    if(member) {
                        let nick = member.nick || member.user.username;

                        if(nick) {
                            selected.push(nick);

                            // max of 3 names users in typing
                            if(selected.length == 3) break;
                        }
                    }
                }

                // if overflow, i18n requires the last parameter be the number remaining
                if(remaining) {
                    selected.push(remaining);
                }

                return LL().main.USERS_TYPING[selected.length - 1](...selected);
            }
        }

        return;
    });

    return (
        <Show when={formatted()}>
            <UIText text={formatted()} />
        </Show>
    )
}