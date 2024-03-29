import { createEffect, createMemo, createSignal, onCleanup, onMount, Show, untrack, useContext } from "solid-js";
import { ShowBool } from "ui/components/flow";
import { useStructuredSelector } from "solid-mutant";

import { IS_MOBILE } from "lib/user_agent";

//import { IMessageState } from "ui/views/main/reducers/messages";
import { RootState, useRootSelector, useRootStore, useRootDispatch } from "state/root";
import { Type } from "state/actions";
import { sendMessage, startTyping } from "state/commands";
import { activeParty, activeRoom } from "state/selectors/active";
import { usePrefs } from "state/contexts/prefs";
import { ITypingState } from "state/mutators/chat";

//import { FileUploadModal } from "ui/views/main/modals/file_upload";
import { Hotkey, MainContext, useMainHotkey } from "ui/hooks/useMain";

import { useI18nContext } from "ui/i18n/i18n-solid";
import { useLocale } from "ui/i18n";
import { UIText } from "ui/components/common/ui-text";
import { VectorIcon } from "ui/components/common/icon";
import { IMsgTextareaController, MsgTextarea } from "ui/components/input/msg_textarea";
import { EmotePicker } from "../common/emote_picker";
import { UserText } from "ui/components/common/ui-text-user";
import { IFileUploadController, UploadPanel } from "./upload";
import { AutoComplete } from "./autocomplete";

import { Icons } from "lantern-icons";
import { createController } from "ui/hooks/createController";

import "./box.scss";
export function MessageBox() {
    const prefs = usePrefs(), { LL, f } = useLocale();

    let state = useStructuredSelector({
        active_room: activeRoom,
        //msg: (state: RootState) => ({ messages: [] as any[], current_edit: null }), // TODO
        showing_footers: (state: RootState) => state.window.showing_footers,
        session: (state: RootState) => state.user.session,
    });

    let dispatch = useRootDispatch();

    //let main = useContext(MainContext);

    let [debug, setDebug] = /*#__PURE__*/ createSignal("");

    let ref: HTMLTextAreaElement | undefined;
    let [tac, setTAC] = createController<IMsgTextareaController>();
    let [fc, setFC] = createController<IFileUploadController>();

    let [value, setValue] = createSignal("");
    let [selection, setSelection] = createSignal(0);
    let [completing, setCompleting] = createSignal(false);
    let ts = 0, skip = false;

    let [show_focus_border, setShowFocusBorder] = createSignal(false);

    createEffect(() => {
        // focus textarea on desktop when active room changes
        if(!IS_MOBILE && state.active_room) { tac()?.focus(); }
    });

    // Load up any available draft, set the textarea to that,
    // then setup a callback to store the new draft when navigating away
    let store = useRootStore();

    createEffect(() => {
        if(state.active_room) {
            __DEV__ && console.log("Loading Draft");

            let room = state.active_room;

            onCleanup(() => {
                __DEV__ && console.log("Storing Draft", value());
                dispatch({ type: Type.MESSAGE_DRAFT, room, draft: value() });
            });

            skip = true; // skip the change event this will emit
            untrack(() => {
                tac()?.setValue(store.state.chat.rooms[state.active_room!]?.draft || "");
                fc()?.reset();
            });
        }
    });

    useMainHotkey(Hotkey.FocusTextArea, () => {
        if(ref && state.active_room) {
            tac()?.focus(); setShowFocusBorder(true);
        }
    });

    let [files, setFiles] = createSignal<[count: number, size: number]>([0, 0]);

    let is_empty = createMemo(() => value().length == 0 && files()[0] == 0);

    let do_send = async () => {
        if(state.active_room && !is_empty()) {
            let attachments = await fc()!.upload();
            dispatch(sendMessage(state.active_room, value().trim(), attachments as any));
            tac()?.setValue("");
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

    let click_file = (e: MouseEvent) => {
        fc()?.click();
        e.stopPropagation();
    };

    let on_send_click = (e: MouseEvent) => {
        e.stopPropagation();
        if(!is_empty()) {
            let f = focused;

            do_send();

            // refocus if lost
            if(f) { tac()?.focus(); }
        }
    };

    let on_keydown = (e: KeyboardEvent) => {
        setShowFocusBorder(false);

        if(e.key == "Enter") {
            if(completing()) {

            }
            do_send();
        }

        if(__DEV__) {
            setDebug(
                (e.ctrlKey ? "Ctrl+" : "") +
                (e.altKey ? "Alt+" : "") +
                (e.shiftKey ? "Shift+" : "") +
                (e.key === " " ? "Spacebar" : e.key)
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
        if(e.defaultPrevented) return;
        e.stopPropagation();
        if(state.active_room) { tac()?.focus(); }
    };

    let on_pick_emote = (e: string, shortcode: string) => {
        tac()?.append(shortcode || e);
        tac()?.focus();
    };

    let debug_node; if(__DEV__) {
        debug_node = (<div class="ln-msg-box__debug"><span textContent={debug()} /></div>);
    }

    return (
        <>
            <div class="ln-msg-box__wrapper"
                classList={{
                    "with-footers": state.showing_footers,
                    "focused": show_focus_border(),
                    "ln-msg-box--disabled": !state.active_room,
                }}
            >
                <UploadPanel onChange={(c, s) => setFiles([c, s])} fc={setFC} />

                <div class="ln-typing ln-typing__top">
                    <ShowBool when={prefs.UseMobileView()}>
                        <UsersTyping />
                    </ShowBool>
                </div>

                <div onClick={on_click_focus} class="ln-msg-box">
                    {/* <AutoComplete value={value()} pos={selection()} onChange={setCompleting} /> */}

                    <EmotePicker onPick={on_pick_emote} />

                    <MsgTextarea
                        onBlur={on_blur}
                        onFocus={on_focus}
                        ref={r => ref = r}
                        tac={setTAC}
                        onKeyDown={on_keydown}
                        onChange={on_change}
                        onSelectionChange={(ta) => setSelection(ta.selectionStart)}
                        mobile={prefs.UseMobileView()}
                        onContextMenu={e => e.stopPropagation()}
                        spellcheck={prefs.EnableSpellcheck()}
                    />

                    {/* {debug_node} */}

                    <div class="ln-msg-box__send visible" onClick={click_file} title={LL().main.ATTACH_FILE()}>
                        <VectorIcon id={Icons.Plus} />
                    </div>

                    <div class="ln-msg-box__send" onClick={on_send_click} title={LL().main.SEND_MESSAGE()}
                        classList={{ "visible": !is_empty() }}
                    >
                        <VectorIcon id={Icons.Send} />
                    </div>

                    <Show when={!state.active_room}>
                        <span class="ln-msg-box__disable" />
                    </Show>
                </div>
            </div>

            <div class="ln-typing ln-typing__bottom">
                <ShowBool when={!prefs.UseMobileView()}>
                    <UsersTyping />
                </ShowBool>

                <span class="ui-text" id="file-upload-meta"
                    textContent={f().bytes(files()[1])}
                    style={{ display: files()[1] ? "" : "none" }}
                />
            </div>

        </>
    );
}

function UsersTyping() {
    let { LL } = useI18nContext(), formatted = useRootSelector((state): string => {
        let active_party = activeParty(state),
            active_room = activeRoom(state);

        if(active_room && active_party) {
            let typing = state.chat.rooms[active_room]?.typing;
            if(typing?.length) {
                let selected = [], member,
                    remaining = typing.length,
                    members = state.party.parties[active_party].members,
                    user_id = state.user.user!.id;

                for(let entry of typing) {
                    remaining -= 1;

                    if(!__DEV__ && entry.user_id == user_id) {
                        // skip self
                        continue;
                    }

                    if(member = members[entry.user_id]) {
                        let nick = member.user.profile?.nick || member.user.username;

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

                return (LL().main.USERS_TYPING as any)[selected.length - 1](...selected);
            }
        }

        return "";
    });

    return <UserText class="ui-text" text={formatted()} />;
}