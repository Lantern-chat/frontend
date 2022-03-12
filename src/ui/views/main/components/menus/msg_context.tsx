import { createEffect, createMemo, createSignal, Show } from "solid-js";
import { useDispatch } from "solid-mutant";

import { copyText } from "lib/clipboard";

import { useRootSelector } from "state/root";
import { UserPreferenceFlags } from "state/models";
import { deleteMessage } from "state/commands/message/delete";
import { IMessageState } from "state/mutators/chat";
import { selectPrefsFlag } from "state/selectors/prefs";

import { VectorIcon } from "ui/components/common/icon";

import { ContextMenu } from "./list";

import { PencilIcon } from "lantern-icons";
import { TrashIcon } from "lantern-icons";
import { TrashOpenIcon } from "lantern-icons";
import { ClipboardIcon } from "lantern-icons";
import { CopyIcon } from "lantern-icons";
import { ChatMessageIcon } from "lantern-icons";
import { TriangleIcon } from "lantern-icons";

export interface IMsgContextMenuProps {
    msg: IMessageState,
    pos: any,
    onConfirmChange: (pending: boolean) => void,
}

/// Menu shown when right-clicking on a message in chat
import "./msg_context.scss";
export function MsgContextMenu(props: IMsgContextMenuProps) {
    let dev_mode = useRootSelector(selectPrefsFlag(UserPreferenceFlags.DeveloperMode));

    let [shownConfirmation, setShownConfirmation] = createSignal(false);

    let confirm_text = createMemo(() => shownConfirmation() ? "Are you sure?" : "Delete Message");

    // if context menu changes position, remove the dialogue
    createEffect(() => (props.pos, setShownConfirmation(false)));
    createEffect(() => props.onConfirmChange(shownConfirmation()));

    let copy_msg = () => props.msg.msg.content && copyText(props.msg.msg.content);

    // it's fine to memoize this since any attempts to select more would trigger a click event and close the context menu
    let selected: string | undefined;
    let selection = window.getSelection(),
        msg_list = document.getElementById("ln-msg-list");

    if(selection && msg_list && msg_list.contains(selection.anchorNode)) {
        selected = selection.toString();
    }

    let copy_selection = () => selected && copyText(selected);

    let dispatch = useDispatch();

    var timer: number | null = null, delayed = false;

    let on_delete = (e: MouseEvent) => {
        if(timer === null) {
            timer = setTimeout(() => { delayed = true; }, 120);
            setShownConfirmation(true);
            e.stopPropagation();
        }

        if(delayed) {
            dispatch(deleteMessage(props.msg.msg.room_id, props.msg.msg.id));
            // Do delete
        } else {
            e.stopPropagation();
        }
    };

    return (
        <ContextMenu>
            <Show when={!!selected}>
                <div onClick={copy_selection}>
                    <VectorIcon src={ClipboardIcon} />
                    <span className="ui-text">Copy Selection</span>
                </div>

                <hr />
            </Show>

            <div>
                <VectorIcon src={PencilIcon} /> <span className="ui-text">Edit Message</span>
            </div>

            <div onClick={copy_msg}>
                <VectorIcon src={CopyIcon} /> <span className="ui-text">Copy Message</span>
            </div>

            <hr />

            <div>
                <VectorIcon src={TriangleIcon} /> <span className="ui-text">Report Message</span>
            </div>

            <div onClick={on_delete}
                classList={{
                    'ln-contextmenu-confirm': shownConfirmation(),
                    'ln-contextmenu-delete': !shownConfirmation(),
                }}
            >
                <Show when={shownConfirmation()} fallback={<VectorIcon src={TrashIcon} />}>
                    <VectorIcon src={TrashOpenIcon} />
                </Show>

                <span className="ui-text">
                    {confirm_text()}
                </span>
            </div>

            <Show when={dev_mode()}>
                <hr />

                <div onClick={() => copyText(props.msg.msg.id)}>
                    <VectorIcon src={ChatMessageIcon} />
                    <span className="ui-text">Copy ID</span>
                </div>
            </Show>

        </ContextMenu>
    )
}
